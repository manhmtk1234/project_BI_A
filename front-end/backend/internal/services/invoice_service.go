package services

import (
	"database/sql"
	"fmt"
	"time"

	"bi-a-management/internal/models"
)

type InvoiceService struct {
	db *sql.DB
}

func NewInvoiceService(db *sql.DB) *InvoiceService {
	return &InvoiceService{db: db}
}

func (s *InvoiceService) CreateInvoice(req *models.CreateInvoiceRequest, createdBy int) (*models.Invoice, error) {
	// Parse time strings
	startTime, err := time.Parse("2006-01-02T15:04:05Z", req.StartTime)
	if err != nil {
		return nil, fmt.Errorf("invalid start_time format: %v", err)
	}

	endTime, err := time.Parse("2006-01-02T15:04:05Z", req.EndTime)
	if err != nil {
		return nil, fmt.Errorf("invalid end_time format: %v", err)
	}

	// Calculate time total
	timeTotal := (float64(req.PlayDurationMinutes) / 60.0) * req.HourlyRate

	// Calculate final amount
	amount := timeTotal + req.ServiceTotal - req.Discount

	// Insert into database
	query := `
		INSERT INTO invoices (
			amount, table_name, start_time, end_time, play_duration_minutes,
			hourly_rate, time_total, services_detail, service_total, discount, created_by
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`

	result, err := s.db.Exec(query,
		amount, req.TableName, startTime, endTime, req.PlayDurationMinutes,
		req.HourlyRate, timeTotal, req.ServicesDetail, req.ServiceTotal, req.Discount, createdBy,
	)

	if err != nil {
		return nil, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	// Return created invoice
	return s.GetInvoiceByID(int(id))
}

func (s *InvoiceService) GetInvoiceByID(id int) (*models.Invoice, error) {
	invoice := &models.Invoice{}
	query := `
		SELECT id, amount, table_name, start_time, end_time, play_duration_minutes,
		       hourly_rate, time_total, services_detail, service_total, discount, created_by, created_at
		FROM invoices WHERE id = ?
	`

	err := s.db.QueryRow(query, id).Scan(
		&invoice.ID, &invoice.Amount, &invoice.TableName, &invoice.StartTime, &invoice.EndTime,
		&invoice.PlayDurationMinutes, &invoice.HourlyRate, &invoice.TimeTotal, &invoice.ServicesDetail,
		&invoice.ServiceTotal, &invoice.Discount, &invoice.CreatedBy, &invoice.CreatedAt,
	)

	if err != nil {
		return nil, err
	}

	return invoice, nil
}

func (s *InvoiceService) GetAllInvoices(limit, offset int) ([]*models.Invoice, error) {
	query := `
		SELECT id, amount, table_name, start_time, end_time, play_duration_minutes,
		       hourly_rate, time_total, services_detail, service_total, discount, created_by, created_at
		FROM invoices 
		ORDER BY created_at DESC
		LIMIT ? OFFSET ?
	`

	rows, err := s.db.Query(query, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var invoices []*models.Invoice
	for rows.Next() {
		invoice := &models.Invoice{}
		err := rows.Scan(
			&invoice.ID, &invoice.Amount, &invoice.TableName, &invoice.StartTime, &invoice.EndTime,
			&invoice.PlayDurationMinutes, &invoice.HourlyRate, &invoice.TimeTotal, &invoice.ServicesDetail,
			&invoice.ServiceTotal, &invoice.Discount, &invoice.CreatedBy, &invoice.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		invoices = append(invoices, invoice)
	}

	return invoices, nil
}

func (s *InvoiceService) GetDailyReport(date string) (map[string]interface{}, error) {
	query := `
		SELECT 
			COUNT(*) as total_invoices,
			SUM(amount) as total_revenue,
			SUM(time_total) as total_time_revenue,
			SUM(service_total) as total_service_revenue
		FROM invoices 
		WHERE DATE(created_at) = ?
	`

	var totalInvoices int
	var totalRevenue, totalTimeRevenue, totalServiceRevenue sql.NullFloat64

	err := s.db.QueryRow(query, date).Scan(
		&totalInvoices, &totalRevenue, &totalTimeRevenue, &totalServiceRevenue,
	)

	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"date":                  date,
		"total_invoices":        totalInvoices,
		"total_revenue":         totalRevenue.Float64,
		"total_time_revenue":    totalTimeRevenue.Float64,
		"total_service_revenue": totalServiceRevenue.Float64,
	}, nil
}

func (s *InvoiceService) GetMonthlyReport(year int, month int) (map[string]interface{}, error) {
	query := `
		SELECT 
			COUNT(*) as total_invoices,
			SUM(amount) as total_revenue,
			SUM(time_total) as total_time_revenue,
			SUM(service_total) as total_service_revenue
		FROM invoices 
		WHERE YEAR(created_at) = ? AND MONTH(created_at) = ?
	`

	var totalInvoices int
	var totalRevenue, totalTimeRevenue, totalServiceRevenue sql.NullFloat64

	err := s.db.QueryRow(query, year, month).Scan(
		&totalInvoices, &totalRevenue, &totalTimeRevenue, &totalServiceRevenue,
	)

	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"year":                  year,
		"month":                 month,
		"total_invoices":        totalInvoices,
		"total_revenue":         totalRevenue.Float64,
		"total_time_revenue":    totalTimeRevenue.Float64,
		"total_service_revenue": totalServiceRevenue.Float64,
	}, nil
}

// CreateInvoiceFromSession - Tự động tạo hóa đơn từ session khi kết thúc
func (s *InvoiceService) CreateInvoiceFromSession(sessionID int, createdBy int) (*models.Invoice, error) {
	// 1. Lấy thông tin session
	sessionQuery := `
		SELECT ts.id, ts.table_id, ts.customer_name, ts.start_time, ts.preset_duration_minutes, 
		       ts.remaining_minutes, ts.actual_duration_minutes, ts.hourly_rate, ts.prepaid_amount,
		       ts.session_type, t.name as table_name
		FROM table_sessions ts
		JOIN tables t ON ts.table_id = t.id 
		WHERE ts.id = ?
	`
	
	var session struct {
		ID                   int            `db:"id"`
		TableID              int            `db:"table_id"`
		CustomerName         sql.NullString `db:"customer_name"`
		StartTime            time.Time      `db:"start_time"`
		PresetDurationMinutes sql.NullInt64 `db:"preset_duration_minutes"`
		RemainingMinutes     sql.NullInt64  `db:"remaining_minutes"`
		ActualDurationMinutes sql.NullInt64 `db:"actual_duration_minutes"`
		HourlyRate           float64        `db:"hourly_rate"`
		PrepaidAmount        float64        `db:"prepaid_amount"`
		SessionType          string         `db:"session_type"`
		TableName            string         `db:"table_name"`
	}

	err := s.db.QueryRow(sessionQuery, sessionID).Scan(
		&session.ID, &session.TableID, &session.CustomerName, &session.StartTime,
		&session.PresetDurationMinutes, &session.RemainingMinutes, &session.ActualDurationMinutes,
		&session.HourlyRate, &session.PrepaidAmount, &session.SessionType, &session.TableName,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get session: %v", err)
	}

	// 2. Tính toán thời gian chơi thực tế
	endTime := time.Now()
	var actualDurationMinutes int
	var tableAmount float64

	if session.SessionType == "fixed_time" {
		// Chơi theo giờ cố định: tính theo preset_duration
		if session.PresetDurationMinutes.Valid {
			actualDurationMinutes = int(session.PresetDurationMinutes.Int64)
		}
		tableAmount = (float64(actualDurationMinutes) / 60.0) * session.HourlyRate
	} else {
		// Chơi mở: tính theo thời gian thực tế
		if session.ActualDurationMinutes.Valid {
			actualDurationMinutes = int(session.ActualDurationMinutes.Int64)
		} else {
			// Tính từ start_time đến hiện tại
			duration := endTime.Sub(session.StartTime)
			actualDurationMinutes = int(duration.Minutes())
		}
		tableAmount = (float64(actualDurationMinutes) / 60.0) * session.HourlyRate
	}

	// 3. Lấy tổng tiền orders trong session
	ordersQuery := `
		SELECT COALESCE(SUM(total_price), 0) as orders_total
		FROM session_orders 
		WHERE session_id = ? AND status != 'cancelled'
	`
	var ordersAmount float64
	err = s.db.QueryRow(ordersQuery, sessionID).Scan(&ordersAmount)
	if err != nil {
		return nil, fmt.Errorf("failed to calculate orders amount: %v", err)
	}

	// 4. Tính tổng tiền
	totalAmount := tableAmount + ordersAmount

	// 5. Lấy chi tiết orders để lưu vào services_detail
	ordersDetailQuery := `
		SELECT p.name, so.quantity, so.unit_price, so.total_price, so.note
		FROM session_orders so
		JOIN products p ON so.product_id = p.id
		WHERE so.session_id = ? AND so.status != 'cancelled'
		ORDER BY so.ordered_at
	`
	
	rows, err := s.db.Query(ordersDetailQuery, sessionID)
	if err != nil {
		return nil, fmt.Errorf("failed to get orders detail: %v", err)
	}
	defer rows.Close()

	var servicesDetail string
	for rows.Next() {
		var name string
		var quantity int
		var unitPrice, totalPrice float64
		var note sql.NullString
		
		err := rows.Scan(&name, &quantity, &unitPrice, &totalPrice, &note)
		if err != nil {
			continue
		}
		
		noteText := ""
		if note.Valid && note.String != "" {
			noteText = fmt.Sprintf(" (%s)", note.String)
		}
		
		servicesDetail += fmt.Sprintf("- %s x%d: %.0f VNĐ%s\n", name, quantity, totalPrice, noteText)
	}

	// 6. Tạo hóa đơn
	insertQuery := `
		INSERT INTO invoices (
			amount, table_amount, orders_amount, discount_amount,
			table_name, start_time, end_time, play_duration_minutes,
			hourly_rate, time_total, services_detail, service_total, 
			discount, session_id, customer_name, payment_status, created_by
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
	`

	result, err := s.db.Exec(insertQuery,
		totalAmount, tableAmount, ordersAmount, 0, // discount_amount = 0 for now
		session.TableName, session.StartTime, endTime, actualDurationMinutes,
		session.HourlyRate, tableAmount, servicesDetail, ordersAmount,
		0, sessionID, session.CustomerName.String, createdBy,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to create invoice: %v", err)
	}

	invoiceID, err := result.LastInsertId()
	if err != nil {
		return nil, fmt.Errorf("failed to get invoice ID: %v", err)
	}

	// 7. Lấy hóa đơn vừa tạo để trả về
	return s.GetInvoiceByID(int(invoiceID))
}
