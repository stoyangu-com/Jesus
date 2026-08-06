-- Supabase Schema Export
-- Generated from user-provided database blueprint

-- 1. Stores Table
CREATE TABLE stores (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    owner_name TEXT,
    whatsapp TEXT,
    logo_url TEXT,
    design_json JSONB,
    user_id TEXT,
    total_visitors INTEGER,
    total_wa_clicks INTEGER,
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Products Table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    store_id INTEGER REFERENCES stores(id),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC,
    image_url TEXT,
    is_hidden BOOLEAN,
    views INTEGER,
    orders INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Profiles Table
CREATE TABLE profiles (
    id TEXT PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    role TEXT,
    store_id INTEGER REFERENCES stores(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Applications Table
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    willing_video BOOLEAN,
    status TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Daily Stats Table
CREATE TABLE daily_stats (
    id SERIAL PRIMARY KEY,
    store_id INTEGER REFERENCES stores(id),
    stat_date TEXT NOT NULL,
    visitors INTEGER,
    wa_clicks INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Product Daily Stats Table
CREATE TABLE product_daily_stats (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    store_id INTEGER REFERENCES stores(id),
    stat_date TEXT NOT NULL,
    views INTEGER,
    orders INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Report Logs Table
CREATE TABLE report_logs (
    id SERIAL PRIMARY KEY,
    store_id INTEGER REFERENCES stores(id),
    report_date TEXT,
    message TEXT,
    status TEXT,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
