-- Users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER',
    phone_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Banquet halls table
CREATE TABLE banquet_halls (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address VARCHAR(500) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    zipcode VARCHAR(20) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    phone VARCHAR(20),
    email VARCHAR(255),
    status VARCHAR(20) DEFAULT 'PENDING',
    terms_conditions TEXT,
    bank_account_name VARCHAR(255),
    bank_account_number VARCHAR(500),
    bank_routing_number VARCHAR(500),
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Hall documents table
CREATE TABLE hall_documents (
    id BIGSERIAL PRIMARY KEY,
    hall_id BIGINT NOT NULL REFERENCES banquet_halls(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Venues table
CREATE TABLE venues (
    id BIGSERIAL PRIMARY KEY,
    hall_id BIGINT NOT NULL REFERENCES banquet_halls(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    capacity INTEGER NOT NULL,
    min_booking_duration_hours INTEGER NOT NULL DEFAULT 2,
    base_price_per_hour DECIMAL(10,2) NOT NULL,
    image_urls TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Venue pricing table
CREATE TABLE venue_pricing (
    id BIGSERIAL PRIMARY KEY,
    venue_id BIGINT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    effective_date DATE NOT NULL,
    slot_start TIME NOT NULL,
    slot_end TIME NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

-- Bookings table
CREATE TABLE bookings (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES users(id),
    venue_id BIGINT NOT NULL REFERENCES venues(id),
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'PENDING',
    payment_mode VARCHAR(20) NOT NULL,
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL REFERENCES bookings(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    stripe_payment_intent_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Hall staff table
CREATE TABLE hall_staff (
    id BIGSERIAL PRIMARY KEY,
    hall_id BIGINT NOT NULL REFERENCES banquet_halls(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id),
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(hall_id, user_id)
);

-- Indexes
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_halls_status ON banquet_halls(status);
CREATE INDEX idx_halls_city ON banquet_halls(city);
CREATE INDEX idx_halls_zipcode ON banquet_halls(zipcode);
CREATE INDEX idx_halls_owner ON banquet_halls(owner_id);
CREATE INDEX idx_venues_hall ON venues(hall_id);
CREATE INDEX idx_venue_pricing_venue_date ON venue_pricing(venue_id, effective_date);
CREATE INDEX idx_bookings_venue_date ON bookings(venue_id, booking_date, status);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_hall_docs_hall ON hall_documents(hall_id);
CREATE INDEX idx_hall_staff_hall ON hall_staff(hall_id);
CREATE INDEX idx_hall_staff_user ON hall_staff(user_id);

-- Seed admin user (password: admin123 - BCrypt encoded)
INSERT INTO users (phone, email, password_hash, full_name, role, phone_verified)
VALUES ('0000000000', 'admin@banquet.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'System Admin', 'ADMIN', true);
