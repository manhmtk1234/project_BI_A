-- ===================================
-- ENHANCED DATABASE SCHEMA FOR BI-A MANAGEMENT
-- ===================================

-- Tables for bi-a table management
CREATE TABLE IF NOT EXISTS tables (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(20) NOT NULL UNIQUE,
    status ENUM('available', 'occupied', 'cleaning', 'maintenance') DEFAULT 'available',
    hourly_rate DECIMAL(10,2) DEFAULT 50000.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table sessions for tracking active games
CREATE TABLE IF NOT EXISTS table_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    table_id INT NOT NULL,
    customer_name VARCHAR(100),
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    preset_duration_minutes INT DEFAULT 60, -- Thời gian đặt trước
    remaining_minutes INT, -- Thời gian còn lại
    hourly_rate DECIMAL(10,2),
    prepaid_amount DECIMAL(10,2) DEFAULT 0, -- Tiền trả trước
    status ENUM('active', 'paused', 'completed', 'expired') DEFAULT 'active',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (table_id) REFERENCES tables(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Products for food/drinks/accessories
CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    category ENUM('drink', 'food', 'accessory', 'service') NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Orders for products ordered during game sessions
CREATE TABLE IF NOT EXISTS session_orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'preparing', 'served', 'cancelled') DEFAULT 'pending',
    ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES table_sessions(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Enhanced invoices table
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS session_id INT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS customer_name VARCHAR(100);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending';
ALTER TABLE invoices ADD FOREIGN KEY IF NOT EXISTS (session_id) REFERENCES table_sessions(id);

-- Insert sample tables (8 tables)
INSERT IGNORE INTO tables (name, hourly_rate) VALUES 
('Bàn 1', 50000.00),
('Bàn 2', 50000.00),
('Bàn 3', 60000.00),
('Bàn 4', 60000.00),
('Bàn 5', 70000.00),
('Bàn 6', 70000.00),
('Bàn 7', 80000.00),
('Bàn 8', 80000.00);

-- Insert sample products
INSERT IGNORE INTO products (name, category, price, stock, description) VALUES 
-- Drinks
('Coca Cola', 'drink', 15000, 100, 'Nước ngọt Coca Cola 330ml'),
('Pepsi', 'drink', 15000, 100, 'Nước ngọt Pepsi 330ml'),
('Bia Saigon', 'drink', 25000, 50, 'Bia Saigon lon 330ml'),
('Bia Tiger', 'drink', 28000, 50, 'Bia Tiger lon 330ml'),
('Nước suối', 'drink', 10000, 200, 'Nước suối Aquafina 500ml'),
('Cà phê đen', 'drink', 20000, 0, 'Cà phê đen nóng'),
('Cà phê sữa', 'drink', 25000, 0, 'Cà phê sữa nóng'),
('Trà đá', 'drink', 10000, 0, 'Trà đá chanh'),

-- Food
('Mì tôm', 'food', 25000, 30, 'Mì tôm trứng'),
('Bánh mì', 'food', 35000, 20, 'Bánh mì thịt nướng'),
('Xúc xích nướng', 'food', 40000, 25, 'Xúc xích nướng 2 cái'),
('Nem nướng', 'food', 45000, 20, 'Nem nướng Nha Trang'),
('Chả cá', 'food', 50000, 15, 'Chả cá nướng'),
('Đậu phộng rang', 'food', 20000, 50, 'Đậu phộng rang muối'),
('Khô bò', 'food', 60000, 30, 'Khô bò miếng'),

-- Accessories
('Phấn bi-a', 'accessory', 5000, 100, 'Phấn đánh bi-a'),
('Găng tay', 'accessory', 150000, 20, 'Găng tay chơi bi-a'),
('Cơ bi-a', 'accessory', 500000, 10, 'Cơ bi-a chuyên nghiệp'),

-- Services
('Làm sạch bàn', 'service', 20000, 0, 'Dịch vụ làm sạch bàn bi-a'),
('Thay nỉ bàn', 'service', 100000, 0, 'Dịch vụ thay nỉ bàn bi-a');
