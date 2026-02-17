-- Seed admin user only if not already present
-- Password: admin123 (BCrypt encoded)
INSERT INTO users (phone, email, password_hash, full_name, role, phone_verified, created_at, updated_at)
SELECT '0000000000', 'admin@banquet.com',
       '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
       'System Admin', 'ADMIN', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM users WHERE phone = '0000000000');
