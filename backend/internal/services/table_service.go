package services

import (
	"database/sql"
	"fmt"
	"log"

	"bi-a-management/internal/models"
)

type TableService struct {
	db *sql.DB
}

func NewTableService(db *sql.DB) *TableService {
	return &TableService{db: db}
}

// Get all tables with current status
func (s *TableService) GetAllTables() ([]models.Table, error) {
	query := `
		SELECT id, name, status, hourly_rate, created_at, updated_at 
		FROM tables 
		ORDER BY name
	`
	
	rows, err := s.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tables []models.Table
	for rows.Next() {
		var table models.Table
		err := rows.Scan(
			&table.ID, &table.Name, &table.Status, &table.HourlyRate,
			&table.CreatedAt, &table.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		tables = append(tables, table)
	}

	return tables, nil
}

// Start a new session
func (s *TableService) StartSession(req *models.StartSessionRequest, createdBy int) (*models.TableSession, error) {
	// Check if table is available
	var currentStatus string
	err := s.db.QueryRow("SELECT status FROM tables WHERE id = ?", req.TableID).Scan(&currentStatus)
	if err != nil {
		return nil, fmt.Errorf("table not found")
	}
	
	if currentStatus != "available" {
		return nil, fmt.Errorf("table is not available")
	}

	// Get table hourly rate
	var hourlyRate float64
	err = s.db.QueryRow("SELECT hourly_rate FROM tables WHERE id = ?", req.TableID).Scan(&hourlyRate)
	if err != nil {
		return nil, err
	}

	// Start transaction
	tx, err := s.db.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	// Create session
	result, err := tx.Exec(`
		INSERT INTO table_sessions 
		(table_id, customer_name, preset_duration_minutes, remaining_minutes, hourly_rate, prepaid_amount, session_type, created_by) 
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`, req.TableID, req.CustomerName, req.PresetDurationMinutes, req.PresetDurationMinutes, hourlyRate, req.PrepaidAmount, req.SessionType, createdBy)
	
	if err != nil {
		return nil, err
	}

	sessionID, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	// Update table status
	_, err = tx.Exec("UPDATE tables SET status = 'occupied' WHERE id = ?", req.TableID)
	if err != nil {
		return nil, err
	}

	if err = tx.Commit(); err != nil {
		return nil, err
	}

	// Return the created session
	return s.GetSessionByID(int(sessionID))
}

// Get session by ID
func (s *TableService) GetSessionByID(id int) (*models.TableSession, error) {
	query := `
		SELECT s.id, s.table_id, t.name as table_name, s.customer_name, s.start_time, 
			   s.preset_duration_minutes, s.remaining_minutes, s.actual_duration_minutes,
			   s.hourly_rate, s.prepaid_amount, s.status, s.session_type, 
			   s.created_by, s.created_at, s.updated_at
		FROM table_sessions s
		JOIN tables t ON s.table_id = t.id
		WHERE s.id = ?
	`
	
	var session models.TableSession
	err := s.db.QueryRow(query, id).Scan(
		&session.ID, &session.TableID, &session.TableName, &session.CustomerName,
		&session.StartTime, &session.PresetDurationMinutes, &session.RemainingMinutes, 
		&session.ActualDurationMinutes, &session.HourlyRate, &session.PrepaidAmount, 
		&session.Status, &session.SessionType, &session.CreatedBy,
		&session.CreatedAt, &session.UpdatedAt,
	)
	
	if err != nil {
		return nil, err
	}

	return &session, nil
}

// Get active sessions
func (s *TableService) GetActiveSessions() ([]models.TableSession, error) {
	query := `
		SELECT s.id, s.table_id, t.name as table_name, s.customer_name, s.start_time, 
			   s.preset_duration_minutes, s.remaining_minutes, s.actual_duration_minutes,
			   s.hourly_rate, s.prepaid_amount, s.status, s.session_type,
			   s.created_by, s.created_at, s.updated_at
		FROM table_sessions s
		JOIN tables t ON s.table_id = t.id
		WHERE s.status = 'active'
		ORDER BY s.start_time
	`
	
	rows, err := s.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sessions []models.TableSession
	for rows.Next() {
		var session models.TableSession
		err := rows.Scan(
			&session.ID, &session.TableID, &session.TableName, &session.CustomerName,
			&session.StartTime, &session.PresetDurationMinutes, &session.RemainingMinutes,
			&session.ActualDurationMinutes, &session.HourlyRate, &session.PrepaidAmount, 
			&session.Status, &session.SessionType, &session.CreatedBy,
			&session.CreatedAt, &session.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		sessions = append(sessions, session)
	}

	return sessions, nil
}

// Update remaining time
func (s *TableService) UpdateRemainingTime(sessionID int, remainingMinutes int) error {
	_, err := s.db.Exec(
		"UPDATE table_sessions SET remaining_minutes = ?, updated_at = NOW() WHERE id = ?",
		remainingMinutes, sessionID,
	)
	return err
}

// End session
func (s *TableService) EndSession(sessionID int) (*models.TableSession, error) {
	// Get session details
	session, err := s.GetSessionByID(sessionID)
	if err != nil {
		return nil, err
	}

	// Start transaction
	tx, err := s.db.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	// Update session status
	_, err = tx.Exec("UPDATE table_sessions SET status = 'completed', updated_at = NOW() WHERE id = ?", sessionID)
	if err != nil {
		return nil, err
	}

	// Update table status
	_, err = tx.Exec("UPDATE tables SET status = 'available' WHERE id = ?", session.TableID)
	if err != nil {
		return nil, err
	}

	if err = tx.Commit(); err != nil {
		return nil, err
	}

	return s.GetSessionByID(sessionID)
}

// Auto-expire sessions that have run out of time
func (s *TableService) AutoExpireSessions() error {
	log.Println("Checking for expired sessions...")
	
	// Find sessions where remaining time <= 0
	query := `
		UPDATE table_sessions 
		SET status = 'expired', updated_at = NOW() 
		WHERE status = 'active' AND remaining_minutes <= 0
	`
	
	result, err := s.db.Exec(query)
	if err != nil {
		return err
	}

	affected, _ := result.RowsAffected()
	if affected > 0 {
		log.Printf("Expired %d sessions", affected)
		
		// Update table status for expired sessions
		_, err = s.db.Exec(`
			UPDATE tables t
			JOIN table_sessions s ON t.id = s.table_id
			SET t.status = 'available'
			WHERE s.status = 'expired'
		`)
		if err != nil {
			return err
		}
	}

	return nil
}

// Update table hourly rate
func (s *TableService) UpdateTableRate(tableID int, hourlyRate float64) error {
	query := `UPDATE tables SET hourly_rate = ?, updated_at = NOW() WHERE id = ?`
	
	result, err := s.db.Exec(query, hourlyRate, tableID)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("table not found")
	}

	return nil
}

// Add minutes to session
func (s *TableService) AddMinutesToSession(sessionID int, addedMinutes int) error {
    _, err := s.db.Exec(
        "UPDATE table_sessions SET preset_duration_minutes = preset_duration_minutes + ?, updated_at = NOW() WHERE id = ?",
        addedMinutes, sessionID,
    )
    return err
}

// Update preset duration
func (s *TableService) UpdatePresetDuration(sessionID int, presetDurationMinutes int) error {
    _, err := s.db.Exec(
        "UPDATE table_sessions SET preset_duration_minutes = ?, updated_at = NOW() WHERE id = ?",
        presetDurationMinutes, sessionID,
    )
    return err
}
