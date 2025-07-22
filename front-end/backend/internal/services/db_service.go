package services

import (
	"database/sql"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

// GetGormDB converts *sql.DB to *gorm.DB
func GetGormDB(sqlDB *sql.DB) (*gorm.DB, error) {
	// Get the connection string from the existing sql.DB
	// Since we already have a working connection, we can use GORM's initialize with existing connection
	gormDB, err := gorm.Open(mysql.New(mysql.Config{
		Conn: sqlDB,
	}), &gorm.Config{})
	
	if err != nil {
		return nil, err
	}
	
	return gormDB, nil
}
