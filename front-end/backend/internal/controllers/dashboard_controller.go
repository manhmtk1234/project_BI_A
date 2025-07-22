package controllers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type DashboardController struct {
	DB *gorm.DB
}

func NewDashboardController(db *gorm.DB) *DashboardController {
	return &DashboardController{DB: db}
}

type DashboardStats struct {
	TodayRevenue     float64 `json:"today_revenue"`
	ActiveSessions   int     `json:"active_sessions"`
	TodayInvoices    int     `json:"today_invoices"`
	AvgSessionTime   float64 `json:"avg_session_time"`
}

// GetDashboardStats returns dashboard statistics
func (dc *DashboardController) GetDashboardStats(c *gin.Context) {
	var stats DashboardStats
	today := time.Now().Format("2006-01-02")

	// Count active sessions
	var activeSessionCount int64
	dc.DB.Table("sessions").Where("status = ?", "active").Count(&activeSessionCount)
	stats.ActiveSessions = int(activeSessionCount)

	// Get today's revenue from invoices
	var todayRevenue float64
	dc.DB.Table("invoices").
		Where("DATE(created_at) = ?", today).
		Where("status != ?", "cancelled").
		Select("COALESCE(SUM(total_amount), 0)").
		Scan(&todayRevenue)
	stats.TodayRevenue = todayRevenue

	// Count today's invoices
	var todayInvoiceCount int64
	dc.DB.Table("invoices").
		Where("DATE(created_at) = ?", today).
		Where("status != ?", "cancelled").
		Count(&todayInvoiceCount)
	stats.TodayInvoices = int(todayInvoiceCount)

	// Calculate average session time for today
	var avgMinutes float64
	dc.DB.Table("sessions").
		Where("DATE(start_time) = ?", today).
		Where("end_time IS NOT NULL").
		Select("AVG(TIMESTAMPDIFF(MINUTE, start_time, end_time))").
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
func (dc *DashboardController) GetRecentActivities(c *gin.Context) {
	var activities []RecentActivity

	// Get recent sessions with table names
	rows, err := dc.DB.Raw(`
		SELECT 
			CASE 
				WHEN s.status = 'active' THEN 'Bắt đầu phiên chơi'
				ELSE 'Kết thúc phiên chơi'
			END as action,
			t.name as table_name,
			s.customer_name,
			DATE_FORMAT(
				CASE 
					WHEN s.status = 'active' THEN s.start_time
					ELSE s.end_time
				END, 
				'%H:%i'
			) as time
		FROM sessions s
		JOIN tables t ON s.table_id = t.id
		WHERE DATE(s.start_time) = CURDATE()
		ORDER BY 
			CASE 
				WHEN s.status = 'active' THEN s.start_time
				ELSE s.end_time
			END DESC
		LIMIT 10
	`).Rows()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	for rows.Next() {
		var activity RecentActivity
		err := rows.Scan(&activity.Action, &activity.Table, &activity.Customer, &activity.Time)
		if err != nil {
			continue
		}
		activities = append(activities, activity)
	}

	c.JSON(http.StatusOK, activities)
}
