package handlers

import (
	"net/http"
	"strconv"
	"time"

	"bi-a-management/internal/models"
	"bi-a-management/internal/services"

	"github.com/gin-gonic/gin"
)

type InvoiceHandler struct {
	invoiceService *services.InvoiceService
}

func NewInvoiceHandler(invoiceService *services.InvoiceService) *InvoiceHandler {
	return &InvoiceHandler{
		invoiceService: invoiceService,
	}
}

func (h *InvoiceHandler) CreateInvoice(c *gin.Context) {
	var req models.CreateInvoiceRequest
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

	invoice, err := h.invoiceService.CreateInvoice(&req, int(createdBy))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, invoice)
}

func (h *InvoiceHandler) GetAllInvoices(c *gin.Context) {
	// Parse query parameters
	limitStr := c.DefaultQuery("limit", "20")
	offsetStr := c.DefaultQuery("offset", "0")

	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid limit parameter"})
		return
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid offset parameter"})
		return
	}

	invoices, err := h.invoiceService.GetAllInvoices(limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"invoices": invoices,
		"limit":    limit,
		"offset":   offset,
	})
}

func (h *InvoiceHandler) GetInvoiceByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid invoice ID"})
		return
	}

	invoice, err := h.invoiceService.GetInvoiceByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Invoice not found"})
		return
	}

	c.JSON(http.StatusOK, invoice)
}

func (h *InvoiceHandler) GetDailyReport(c *gin.Context) {
	date := c.DefaultQuery("date", time.Now().Format("2006-01-02"))

	report, err := h.invoiceService.GetDailyReport(date)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, report)
}

func (h *InvoiceHandler) GetMonthlyReport(c *gin.Context) {
	yearStr := c.DefaultQuery("year", strconv.Itoa(time.Now().Year()))
	monthStr := c.DefaultQuery("month", strconv.Itoa(int(time.Now().Month())))

	year, err := strconv.Atoi(yearStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid year parameter"})
		return
	}

	month, err := strconv.Atoi(monthStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid month parameter"})
		return
	}

	report, err := h.invoiceService.GetMonthlyReport(year, month)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, report)
}
