package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type DashboardHandler struct {
	db *gorm.DB
}

func NewDashboardHandler(db *gorm.DB) *DashboardHandler {
	return &DashboardHandler{db: db}
}

type DashboardStats struct {
	TodayRevenue     float64 `json:"today_revenue"`
	ActiveSessions   int     `json:"active_sessions"`
	TodayInvoices    int     `json:"today_invoices"`
	AvgSessionTime   float64 `json:"avg_session_time"`
}

// GetDashboardStats returns dashboard statistics
func (h *DashboardHandler) GetDashboardStats(c *gin.Context) {
	var stats DashboardStats
	today := time.Now().Format("2006-01-02")

	// Count active sessions using correct table name
	var activeSessionCount int64
	h.db.Table("table_sessions").Where("status = ?", "active").Count(&activeSessionCount)
	stats.ActiveSessions = int(activeSessionCount)

	// Get today's revenue from invoices using correct column name
	var todayRevenue float64
	h.db.Table("invoices").
		Where("DATE(created_at) = ?", today).
		Select("COALESCE(SUM(amount), 0)").
		Scan(&todayRevenue)
	stats.TodayRevenue = todayRevenue

	// Count today's invoices using correct table structure
	var todayInvoiceCount int64
	h.db.Table("invoices").
		Where("DATE(created_at) = ?", today).
		Count(&todayInvoiceCount)
	stats.TodayInvoices = int(todayInvoiceCount)

	// Calculate average session time using correct table name and available columns
	var avgMinutes float64
	h.db.Table("table_sessions").
		Where("DATE(start_time) = ?", today).
		Where("status IN ('completed', 'expired')").
		Select("AVG(preset_duration_minutes - COALESCE(remaining_minutes, 0))").
		Scan(&avgMinutes)
	stats.AvgSessionTime = avgMinutes / 60.0 // Convert to hours

	c.JSON(http.StatusOK, stats)
}

type RecentActivity struct {
	Action   string `json:"action"`
	Table    string `json:"table"`
	Customer string `json:"customer"`
	Time     string `json:"time"`
}

// GetRecentActivities returns recent activities
func (h *DashboardHandler) GetRecentActivities(c *gin.Context) {
	var activities []RecentActivity

	// Get recent sessions with table names using GORM
	var sessions []struct {
		Action   string `json:"action"`
		TableName string `json:"table_name"`
		Customer string `json:"customer"`
		Time     string `json:"time"`
	}

	err := h.db.Table("table_sessions s").
		Select(`
			CASE 
				WHEN s.status = 'active' THEN 'Bắt đầu phiên chơi'
				ELSE 'Kết thúc phiên chơi'
			END as action,
			t.name as table_name,
			s.customer_name as customer,
			DATE_FORMAT(s.start_time, '%H:%i') as time
		`).
		Joins("JOIN tables t ON s.table_id = t.id").
		Where("DATE(s.start_time) = CURDATE()").
		Order("s.start_time DESC").
		Limit(10).
		Scan(&sessions).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Convert to RecentActivity slice
	for _, session := range sessions {
		activities = append(activities, RecentActivity{
			Action:   session.Action,
			Table:    session.TableName,
			Customer: session.Customer,
			Time:     session.Time,
		})
	}

	c.JSON(http.StatusOK, activities)
}
