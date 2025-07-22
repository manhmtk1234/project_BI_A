package services

import (
	"database/sql"
	"fmt"

	"bi-a-management/internal/models"
)

type ProductService struct {
	db *sql.DB
}

func NewProductService(db *sql.DB) *ProductService {
	return &ProductService{db: db}
}

// Get all products
func (s *ProductService) GetAllProducts() ([]models.Product, error) {
	query := `
		SELECT id, name, category, price, description, is_active, created_at, updated_at 
		FROM products 
		WHERE is_active = true
		ORDER BY category, name
	`
	
	rows, err := s.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []models.Product
	for rows.Next() {
		var product models.Product
		err := rows.Scan(
			&product.ID, &product.Name, &product.Category, &product.Price,
			&product.Description, &product.IsActive,
			&product.CreatedAt, &product.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		products = append(products, product)
	}

	return products, nil
}

// Get products by category
func (s *ProductService) GetProductsByCategory(category string) ([]models.Product, error) {
	query := `
		SELECT id, name, category, price, description, is_active, created_at, updated_at 
		FROM products 
		WHERE category = ? AND is_active = true
		ORDER BY name
	`
	
	rows, err := s.db.Query(query, category)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []models.Product
	for rows.Next() {
		var product models.Product
		err := rows.Scan(
			&product.ID, &product.Name, &product.Category, &product.Price,
			&product.Description, &product.IsActive,
			&product.CreatedAt, &product.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		products = append(products, product)
	}

	return products, nil
}

// Add order to session
func (s *ProductService) AddOrderToSession(req *models.AddOrderRequest) ([]models.SessionOrder, error) {
	// Verify session exists and is active
	var sessionStatus string
	err := s.db.QueryRow("SELECT status FROM table_sessions WHERE id = ?", req.SessionID).Scan(&sessionStatus)
	if err != nil {
		return nil, fmt.Errorf("session not found")
	}
	
	if sessionStatus != "active" {
		return nil, fmt.Errorf("session is not active")
	}

	// Start transaction
	tx, err := s.db.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	var orders []models.SessionOrder

	for _, item := range req.Items {
		// Get product details
		var product models.Product
		err := tx.QueryRow(
			"SELECT id, name, price FROM products WHERE id = ? AND is_active = true",
			item.ProductID,
		).Scan(&product.ID, &product.Name, &product.Price)
		
		if err != nil {
			return nil, fmt.Errorf("product %d not found", item.ProductID)
		}

		totalPrice := product.Price * float64(item.Quantity)

		// Insert order
		result, err := tx.Exec(`
			INSERT INTO session_orders (session_id, product_id, quantity, unit_price, total_price)
			VALUES (?, ?, ?, ?, ?)
		`, req.SessionID, item.ProductID, item.Quantity, product.Price, totalPrice)
		
		if err != nil {
			return nil, err
		}

		orderID, err := result.LastInsertId()
		if err != nil {
			return nil, err
		}

		// Create order object
		order := models.SessionOrder{
			ID:          uint(orderID),
			SessionID:   req.SessionID,
			ProductID:   item.ProductID,
			ProductName: product.Name,
			Quantity:    item.Quantity,
			UnitPrice:   product.Price,
			TotalPrice:  totalPrice,
			Status:      "pending",
		}
		orders = append(orders, order)
	}

	if err = tx.Commit(); err != nil {
		return nil, err
	}

	return orders, nil
}

// Get session orders
func (s *ProductService) GetSessionOrders(sessionID int) ([]models.SessionOrder, error) {
	query := `
		SELECT o.id, o.session_id, o.product_id, p.name as product_name,
			   o.quantity, o.unit_price, o.total_price, o.status, o.ordered_at
		FROM session_orders o
		JOIN products p ON o.product_id = p.id
		WHERE o.session_id = ?
		ORDER BY o.ordered_at DESC
	`
	
	rows, err := s.db.Query(query, sessionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []models.SessionOrder
	for rows.Next() {
		var order models.SessionOrder
		err := rows.Scan(
			&order.ID, &order.SessionID, &order.ProductID, &order.ProductName,
			&order.Quantity, &order.UnitPrice, &order.TotalPrice, &order.Status,
			&order.OrderedAt,
		)
		if err != nil {
			return nil, err
		}
		orders = append(orders, order)
	}

	return orders, nil
}

// Create product
func (s *ProductService) CreateProduct(product *models.Product) (*models.Product, error) {
	result, err := s.db.Exec(`
		INSERT INTO products (name, category, price, description)
		VALUES (?, ?, ?, ?)
	`, product.Name, product.Category, product.Price, product.Description)
	
	if err != nil {
		return nil, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	product.ID = uint(id)
	return product, nil
}

// Update product
func (s *ProductService) UpdateProduct(id int, product *models.Product) (*models.Product, error) {
	_, err := s.db.Exec(`
		UPDATE products 
		SET name = ?, category = ?, price = ?, description = ?, updated_at = NOW()
		WHERE id = ?
	`, product.Name, product.Category, product.Price, product.Description, id)
	
	if err != nil {
		return nil, err
	}

	product.ID = uint(id)
	return product, nil
}

// Delete product (soft delete)
func (s *ProductService) DeleteProduct(id int) error {
	_, err := s.db.Exec("UPDATE products SET is_active = false WHERE id = ?", id)
	return err
}

// Get total amount of orders in a session
func (s *ProductService) GetSessionOrdersTotal(sessionID int) (float64, error) {
	query := `
		SELECT COALESCE(SUM(total_price), 0) as orders_total
		FROM session_orders 
		WHERE session_id = ? AND status != 'cancelled'
	`
	
	var total float64
	err := s.db.QueryRow(query, sessionID).Scan(&total)
	if err != nil {
		return 0, fmt.Errorf("failed to get session orders total: %v", err)
	}
	
	return total, nil
}
