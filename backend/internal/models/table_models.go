package models

import (
	"time"
	"gorm.io/gorm"
)

// Table represents a bi-a table
type Table struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	Name       string    `gorm:"uniqueIndex" json:"name"`
	Status     string    `gorm:"default:available" json:"status"` // available, occupied, cleaning, maintenance
	HourlyRate float64   `json:"hourly_rate"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableSession represents an active playing session
type TableSession struct {
	ID                    uint       `gorm:"primaryKey" json:"id"`
	TableID               uint       `json:"table_id"`
	TableName             string     `gorm:"-" json:"table_name,omitempty"` // joined from tables
	CustomerName          string     `json:"customer_name"`
	StartTime             time.Time  `json:"start_time"`
	EndTime               *time.Time `json:"end_time"`
	PresetDurationMinutes int        `json:"preset_duration_minutes"`
	RemainingMinutes      *int       `json:"remaining_minutes"`
	ActualDurationMinutes *int       `json:"actual_duration_minutes"`
	HourlyRate            float64    `json:"hourly_rate"`
	PrepaidAmount         float64    `gorm:"default:0" json:"prepaid_amount"`
	Status                string     `gorm:"default:active" json:"status"` // active, paused, completed, expired
	SessionType           string     `gorm:"default:fixed_time" json:"session_type"` // fixed_time, open_play
	CreatedBy             uint       `json:"created_by"`
	CreatedAt             time.Time  `json:"created_at"`
	UpdatedAt             time.Time  `json:"updated_at"`
	DeletedAt             gorm.DeletedAt `gorm:"index" json:"-"`

	// Relations
	Table Table `gorm:"foreignKey:TableID" json:"table,omitempty"`
}

// Product represents items that can be ordered
type Product struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"uniqueIndex" json:"name"`
	Category    string    `gorm:"default:drink" json:"category"` // drink, food, accessory, service
	Price       float64   `json:"price"`
	Description string    `gorm:"type:text" json:"description"`
	IsActive    bool      `gorm:"default:true" json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// SessionOrder represents products ordered during a session
type SessionOrder struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	SessionID   uint      `json:"session_id"`
	ProductID   uint      `json:"product_id"`
	ProductName string    `gorm:"-" json:"product_name,omitempty"` // joined from products
	Quantity    int       `json:"quantity"`
	UnitPrice   float64   `json:"unit_price"`
	TotalPrice  float64   `json:"total_price"`
	Status      string    `gorm:"default:pending" json:"status"` // pending, preparing, served, cancelled
	OrderedAt   time.Time `gorm:"autoCreateTime" json:"ordered_at"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	// Relations
	Session TableSession `gorm:"foreignKey:SessionID" json:"session,omitempty"`
	Product Product      `gorm:"foreignKey:ProductID" json:"product,omitempty"`
}

// Request/Response models
type StartSessionRequest struct {
	TableID               uint    `json:"table_id" binding:"required"`
	CustomerName          string  `json:"customer_name" binding:"required"`
	PresetDurationMinutes int     `json:"preset_duration_minutes" binding:"required,min=1,max=480"` // 15 min to 8 hours
	PrepaidAmount         float64 `json:"prepaid_amount"`
	SessionType           string  `json:"session_type" binding:"required,oneof=fixed_time open_play"`
}

type AddOrderRequest struct {
	SessionID uint                  `json:"session_id" binding:"required"`
	Items     []AddOrderItemRequest `json:"items" binding:"required,dive"`
}

type AddOrderItemRequest struct {
	ProductID uint `json:"product_id" binding:"required"`
	Quantity  int  `json:"quantity" binding:"required,min=1"`
}

type SessionWithDetails struct {
	TableSession
	Orders []SessionOrder `json:"orders,omitempty"`
	TotalOrderAmount float64 `json:"total_order_amount"`
}

// Enhanced Invoice with session details
type EnhancedInvoice struct {
	Invoice
	SessionID    *uint  `json:"session_id" gorm:"column:session_id"`
	CustomerName string `json:"customer_name" db:"customer_name"`
	PaymentStatus string `json:"payment_status" db:"payment_status"`
}

// Helper function to get current time
func GetTimeNow() time.Time {
	return time.Now()
}
