-- ===================================
-- CONSOLIDATED MIGRATION FOR PHASE 1
-- ===================================

-- Kiểm tra và thêm session_type nếu chưa có
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'bi_a_tuananh' 
  AND TABLE_NAME = 'table_sessions' 
  AND COLUMN_NAME = 'session_type';

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE table_sessions ADD COLUMN session_type ENUM(''fixed_time'', ''open_play'') DEFAULT ''fixed_time'' AFTER status',
  'SELECT "session_type column already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Thêm actual_duration_minutes nếu chưa có
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'bi_a_tuananh' 
  AND TABLE_NAME = 'table_sessions' 
  AND COLUMN_NAME = 'actual_duration_minutes';

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE table_sessions ADD COLUMN actual_duration_minutes INT AFTER remaining_minutes',
  'SELECT "actual_duration_minutes column already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Thêm cột cho invoices
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS table_amount DECIMAL(10,2) DEFAULT 0 AFTER amount,
ADD COLUMN IF NOT EXISTS orders_amount DECIMAL(10,2) DEFAULT 0 AFTER table_amount,
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0 AFTER orders_amount;

-- Thêm note cho session_orders
ALTER TABLE session_orders 
ADD COLUMN IF NOT EXISTS note TEXT AFTER total_price;

-- Tạo indexes
CREATE INDEX IF NOT EXISTS idx_session_orders_session_id ON session_orders(session_id);
CREATE INDEX IF NOT EXISTS idx_invoices_session_id ON invoices(session_id);
CREATE INDEX IF NOT EXISTS idx_table_sessions_status ON table_sessions(status);

-- Cập nhật existing data
UPDATE table_sessions 
SET session_type = 'fixed_time' 
WHERE session_type IS NULL AND preset_duration_minutes > 0;

UPDATE table_sessions 
SET session_type = 'open_play' 
WHERE session_type IS NULL AND (preset_duration_minutes IS NULL OR preset_duration_minutes = 0);
