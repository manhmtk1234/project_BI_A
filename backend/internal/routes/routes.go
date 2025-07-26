package routes

import (
	"database/sql"

	"bi-a-management/internal/config"
	"bi-a-management/internal/handlers"
	"bi-a-management/internal/middleware"
	"bi-a-management/internal/services"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(db *sql.DB, cfg *config.Config) *gin.Engine {
	router := gin.Default()

	// CORS middleware - Allow all origins for public access
	router.Use(cors.New(cors.Config{
		AllowAllOrigins:  true,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: false,
	}))

	// Initialize services
	authService := services.NewAuthService(db, cfg.JWTSecret)
	invoiceService := services.NewInvoiceService(db)
	tableService := services.NewTableService(db)
	productService := services.NewProductService(db)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService)
	invoiceHandler := handlers.NewInvoiceHandler(invoiceService)
	tableHandler := handlers.NewTableHandler(tableService, productService, invoiceService)
	productHandler := handlers.NewProductHandler(productService)
	
	// Convert sql.DB to GORM for dashboard handler
	gormDB, err := services.GetGormDB(db)
	if err != nil {
		panic("Failed to create GORM DB: " + err.Error())
	}
	dashboardHandler := handlers.NewDashboardHandler(gormDB)

	// API routes
	api := router.Group("/api")
	
	// Health check
	api.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "Bi-A Management API is running",
		})
	})

	// Auth routes
	auth := api.Group("/auth")
	{
		auth.POST("/login", authHandler.Login)
		auth.POST("/logout", authHandler.Logout)
	}

	// Protected routes
	protected := api.Group("/")
	protected.Use(middleware.AuthMiddleware(cfg.JWTSecret))
	{
		// Tables routes
		tables := protected.Group("/tables")
		{
			tables.GET("/", tableHandler.GetAllTables)
			tables.PUT("/:id/rate", tableHandler.UpdateTableRate)
			tables.GET("/sessions", tableHandler.GetActiveSessions)
			tables.POST("/sessions", tableHandler.StartSession)
			tables.GET("/sessions/:id", tableHandler.GetSessionByID)
			tables.GET("/sessions/:id/orders", tableHandler.GetSessionOrders)
			tables.GET("/sessions/:id/calculate-amount", tableHandler.CalculateSessionAmount)
			tables.PUT("/sessions/:id/time", tableHandler.UpdateRemainingTime)
			tables.POST("/sessions/:id/end", tableHandler.EndSession)
			tables.POST("/sessions/orders", tableHandler.AddOrderToSession)
			tables.POST("/sessions/expire", tableHandler.AutoExpireSessions)
			tables.PUT("/sessions/:id/preset-duration", tableHandler.UpdatePresetDuration)
		}

		// Products routes
		products := protected.Group("/products")
		{
			products.GET("/", productHandler.GetAllProducts)
			products.POST("/", productHandler.CreateProduct)
			products.PUT("/:id", productHandler.UpdateProduct)
			products.DELETE("/:id", productHandler.DeleteProduct)
		}

		// Invoices routes
		invoices := protected.Group("/invoices")
		{
			invoices.POST("/", invoiceHandler.CreateInvoice)
			invoices.GET("/", invoiceHandler.GetAllInvoices)
			invoices.GET("/:id", invoiceHandler.GetInvoiceByID)
		}

		// Reports routes
		reports := protected.Group("/reports")
		{
			reports.GET("/daily", invoiceHandler.GetDailyReport)
			reports.GET("/monthly", invoiceHandler.GetMonthlyReport)
		}

		// Dashboard routes
		dashboard := protected.Group("/dashboard")
		{
			dashboard.GET("/stats", dashboardHandler.GetDashboardStats)
			dashboard.GET("/activities", dashboardHandler.GetRecentActivities)
		}
	}

	return router
}
