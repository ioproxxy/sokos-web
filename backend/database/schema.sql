-- ========================================================
-- SOKO SOKO DATABASE SCHEMA (PostgreSQL / MySQL)
-- Enhanced for SaaS Multi-Tenant Subscriptions
-- ========================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(100) UNIQUE,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    avatar_url TEXT,
    password TEXT,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    doc_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_doc_type VARCHAR(30) DEFAULT NULL, -- 'national_id', 'passport', 'business_permit'
    rating DECIMAL(3, 2) NOT NULL DEFAULT 0.00,
    reviews_count INT NOT NULL DEFAULT 0,
    location_name VARCHAR(150) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    onboarded BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- SaaS Vendor enhancements
    subscription_plan VARCHAR(20) DEFAULT 'free', -- 'free', 'bronze', 'silver', 'gold'
    subscription_status VARCHAR(20) DEFAULT 'none', -- 'active', 'expiring', 'none'
    subscription_expires_at TIMESTAMP DEFAULT NULL,
    store_name VARCHAR(150) DEFAULT NULL,
    store_tagline TEXT DEFAULT NULL,
    store_banner TEXT DEFAULT NULL,
    premium_boost_quota INT DEFAULT 0
);

-- 2. LISTINGS TABLE
CREATE TABLE IF NOT EXISTS listings (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    images TEXT NOT NULL, 
    vendor_id VARCHAR(50) NOT NULL,
    vendor_name VARCHAR(100) NOT NULL,
    vendor_verified BOOLEAN NOT NULL DEFAULT FALSE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'sold'
    condition VARCHAR(20) NOT NULL, -- 'new', 'like_new', 'good', 'fair'
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- SaaS Listing enhancements
    is_boosted BOOLEAN NOT NULL DEFAULT FALSE,
    boost_expires_at TIMESTAMP DEFAULT NULL,
    views INT NOT NULL DEFAULT 0,
    urgency_level VARCHAR(20) DEFAULT 'low',
    FOREIGN KEY (vendor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(50) PRIMARY KEY,
    sender_id VARCHAR(50) NOT NULL,
    receiver_id VARCHAR(50) NOT NULL,
    listing_id VARCHAR(50) NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
);

-- 4. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(50) PRIMARY KEY,
    target_user_id VARCHAR(50) NOT NULL, -- Vendor being rated
    reviewer_id VARCHAR(50) NOT NULL,
    reviewer_name VARCHAR(100) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    text TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY,
    buyer_id VARCHAR(50) NOT NULL,
    buyer_name VARCHAR(100) NOT NULL,
    seller_id VARCHAR(50) NOT NULL,
    seller_name VARCHAR(100) NOT NULL,
    listing_id VARCHAR(50) NOT NULL,
    listing_title VARCHAR(200) NOT NULL,
    listing_image TEXT NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending', -- 'pending', 'mpesa_pending', 'paid', 'completed', 'cancelled'
    payment_method VARCHAR(20) NOT NULL, -- 'mpesa', 'cash'
    mpesa_phone VARCHAR(20) DEFAULT NULL,
    mpesa_checkout_request_id VARCHAR(100) DEFAULT NULL,
    mpesa_receipt_number VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
);

-- 6. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    link TEXT DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
