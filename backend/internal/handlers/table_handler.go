package handlers

import (
	"net/http"
	"strconv"

	"bi-a-management/internal/models"
	"bi-a-management/internal/services"

	"github.com/gin-gonic/gin"
)

type TableHandler struct {
	tableService   *services.TableService
	productService *services.ProductService
	invoiceService *services.InvoiceService
}

func NewTableHandler(tableService *services.TableService, productService *services.ProductService, invoiceService *services.InvoiceService) *TableHandler {
	return &TableHandler{
		tableService:   tableService,
		productService: productService,
		invoiceService: invoiceService,
	}
}

// Get all tables
func (h *TableHandler) GetAllTables(c *gin.Context) {
	tables, err := h.tableService.GetAllTables()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"tables": tables})
}

// Start session
func (h *TableHandler) StartSession(c *gin.Context) {
	var req models.StartSessionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user ID from JWT
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	createdBy, ok := userID.(float64)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID"})
		return
	}

	session, err := h.tableService.StartSession(&req, int(createdBy))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, session)
}

// Get active sessions
func (h *TableHandler) GetActiveSessions(c *gin.Context) {
	sessions, err := h.tableService.GetActiveSessions()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"sessions": sessions})
}

// Get session by ID
func (h *TableHandler) GetSessionByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid session ID"})
		return
	}

	session, err := h.tableService.GetSessionByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Session not found"})
		return
	}

	// Get orders for this session
	orders, err := h.productService.GetSessionOrders(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Calculate total order amount
	var totalOrderAmount float64
	for _, order := range orders {
		totalOrderAmount += order.TotalPrice
	}

	sessionDetails := models.SessionWithDetails{
		TableSession:     *session,
		Orders:           orders,
		TotalOrderAmount: totalOrderAmount,
	}

	c.JSON(http.StatusOK, sessionDetails)
}

// Update remaining time
func (h *TableHandler) UpdateRemainingTime(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid session ID"})
		return
	}

	var req struct {
		RemainingMinutes int `json:"remaining_minutes" binding:"required"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = h.tableService.UpdateRemainingTime(id, req.RemainingMinutes)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Time updated successfully"})
}

// End session
func (h *TableHandler) EndSession(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid session ID"})
		return
	}

	// Get user ID from JWT for invoice creation
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	createdBy, ok := userID.(float64)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID"})
		return
	}

	// End the session
	session, err := h.tableService.EndSession(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Automatically create invoice from session
	invoice, err := h.invoiceService.CreateInvoiceFromSession(id, int(createdBy))
	if err != nil {
		// Log error but don't fail the session end
		// In production, you might want to handle this differently
		c.JSON(http.StatusOK, gin.H{
			"message":        "Session ended successfully",
			"session":        session,
			"invoice_error":  err.Error(),
			"invoice_id":     nil,
			"total_amount":   0,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":      "Session ended successfully",
		"session":      session,
		"invoice_id":   invoice.ID,
		"total_amount": invoice.Amount,
	})
}

// Add order to session
func (h *TableHandler) AddOrderToSession(c *gin.Context) {
	var req models.AddOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	orders, err := h.productService.AddOrderToSession(&req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"orders": orders})
}

// Get orders for a session
func (h *TableHandler) GetSessionOrders(c *gin.Context) {
	idStr := c.Param("id")
	sessionID, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid session ID"})
		return
	}

	orders, err := h.productService.GetSessionOrders(sessionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"orders": orders})
}

// Auto-expire sessions (to be called periodically)
func (h *TableHandler) AutoExpireSessions(c *gin.Context) {
	err := h.tableService.AutoExpireSessions()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Sessions checked and expired if needed"})
}

// Calculate current amount for a session (realtime)
func (h *TableHandler) CalculateSessionAmount(c *gin.Context) {
	idStr := c.Param("id")
	sessionID, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid session ID"})
		return
	}

	// Get session info
	session, err := h.tableService.GetSessionByID(sessionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Calculate table amount based on session type
	var tableAmount float64
	var actualMinutes int
	
	if session.SessionType == "fixed_time" {
		// Fixed time: use preset duration
		actualMinutes = session.PresetDurationMinutes
		tableAmount = (float64(actualMinutes) / 60.0) * session.HourlyRate
	} else {
		// Open play: calculate from start time to now
		duration := models.GetTimeNow().Sub(session.StartTime)
		actualMinutes = int(duration.Minutes())
		tableAmount = (float64(actualMinutes) / 60.0) * session.HourlyRate
	}

	// Get orders amount
	ordersAmount, err := h.productService.GetSessionOrdersTotal(sessionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Calculate total
	totalAmount := tableAmount + ordersAmount

	c.JSON(http.StatusOK, gin.H{
		"session_id":        sessionID,
		"session_type":      session.SessionType,
		"actual_minutes":    actualMinutes,
		"table_amount":      tableAmount,
		"orders_amount":     ordersAmount,
		"total_amount":      totalAmount,
		"hourly_rate":       session.HourlyRate,
	})
}

// Update table hourly rate
func (h *TableHandler) UpdateTableRate(c *gin.Context) {
	// Get table ID from URL parameter
	tableIDStr := c.Param("id")
	tableID, err := strconv.Atoi(tableIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid table ID"})
		return
	}

	// Parse request body
	var req struct {
		HourlyRate float64 `json:"hourly_rate" binding:"required,gt=0"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update table rate
	err = h.tableService.UpdateTableRate(tableID, req.HourlyRate)
	if err != nil {
		if err.Error() == "table not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Table not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Table rate updated successfully",
		"table_id": tableID,
		"hourly_rate": req.HourlyRate,
	})
}

// Update session duration
type UpdateDurationRequest struct {
    AddedMinutes int `json:"added_minutes" binding:"required"`
}

func (h *TableHandler) UpdateSessionDuration(c *gin.Context) {
    idStr := c.Param("id")
    id, err := strconv.Atoi(idStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid session id"})
        return
    }
    var req UpdateDurationRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    err = h.tableService.AddMinutesToSession(id, req.AddedMinutes)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, gin.H{"message": "Duration updated successfully"})
}

// Update preset duration
type UpdatePresetDurationRequest struct {
    PresetDurationMinutes int `json:"preset_duration_minutes" binding:"required,min=1,max=480"`
}

func (h *TableHandler) UpdatePresetDuration(c *gin.Context) {
    idStr := c.Param("id")
    id, err := strconv.Atoi(idStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid session id"})
        return
    }
    var req UpdatePresetDurationRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    err = h.tableService.UpdatePresetDuration(id, req.PresetDurationMinutes)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, gin.H{"message": "Preset duration updated successfully"})
}
