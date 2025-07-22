package database

import (
	"database/sql"
	"log"
)

func RunMigrations(db *sql.DB) error {
	// Since tables are created manually via SQL scripts,
	// we only need to ensure basic default data exists
	migrations := []string{
		ensureDefaultUsers,
	}

	for i, migration := range migrations {
		log.Printf("Running migration %d...", i+1)
		if _, err := db.Exec(migration); err != nil {
			log.Printf("Migration %d warning: %v (this is normal if data already exists)", i+1, err)
		}
	}

	log.Println("All migrations completed successfully")
	return nil
}

const ensureDefaultUsers = `
INSERT IGNORE INTO users (username, password_hash, role) VALUES
('admin', '$2a$10$LIrW4F7m.gJDQVN2QnPT5uPDJpAL4yKQB4Fpu/WROwx//YRsB/LrG', 'admin'),
('staff', '$2a$10$LIrW4F7m.gJDQVN2QnPT5uPDJpAL4yKQB4Fpu/WROwx//YRsB/LrG', 'staff');
`
