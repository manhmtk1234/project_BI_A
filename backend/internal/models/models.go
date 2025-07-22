package models

import (
	"time"
	"gorm.io/gorm"
)

type User struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Username     string    `gorm:"uniqueIndex" json:"username"`
	PasswordHash string    `gorm:"column:password_hash" json:"-"`
	Role         string    `gorm:"default:user" json:"role"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

type Invoice struct {
	ID                  uint      `gorm:"primaryKey" json:"id"`
	Amount              float64   `gorm:"column:total_amount" json:"amount"`
	TableName           string    `json:"table_name"`
	StartTime           time.Time `json:"start_time"`
	EndTime             time.Time `json:"end_time"`
	PlayDurationMinutes int       `json:"play_duration_minutes"`
	HourlyRate          float64   `json:"hourly_rate"`
	TimeTotal           float64   `json:"time_total"`
	ServicesDetail      string    `gorm:"type:text" json:"services_detail"` // JSON string
	ServiceTotal        float64   `json:"service_total"`
	Discount            float64   `gorm:"default:0" json:"discount"`
	Status              string    `gorm:"default:pending" json:"status"` // paid, pending, cancelled
	CreatedBy           uint      `json:"created_by"`
	CreatedAt           time.Time `json:"created_at"`
	UpdatedAt           time.Time `json:"updated_at"`
	DeletedAt           gorm.DeletedAt `gorm:"index" json:"-"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type CreateInvoiceRequest struct {
	TableName           string  `json:"table_name" binding:"required"`
	StartTime           string  `json:"start_time" binding:"required"`
	EndTime             string  `json:"end_time" binding:"required"`
	PlayDurationMinutes int     `json:"play_duration_minutes" binding:"required"`
	HourlyRate          float64 `json:"hourly_rate" binding:"required"`
	ServicesDetail      string  `json:"services_detail"`
	ServiceTotal        float64 `json:"service_total"`
	Discount            float64 `json:"discount"`
}
