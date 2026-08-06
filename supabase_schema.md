# Supabase Database Schema Documentation

This document provides a complete overview of the database structure for the project.

## 1. Tables Overview

### 🏪 Stores
Main table containing store configuration and ownership.
- **id**: Unique identifier (Primary Key)
- **name**: Store name
- **slug**: URL identifier
- **owner_name**: Name of the store owner
- **whatsapp**: WhatsApp contact info
- **logo_url**: Link to store logo
- **design_json**: JSON configuration for store design
- **user_id**: Linked user account
- **total_visitors**: Lifetime visitor count
- **total_wa_clicks**: Lifetime WhatsApp click count
- **is_active**: Whether the store is live
- **created_at**: Date of creation

### 📦 Products
Items associated with a specific store.
- **id**: Unique identifier (Primary Key)
- **store_id**: Linked to `stores.id`
- **name**: Product name
- **description**: Product details
- **price**: Selling price
- **image_url**: Link to product image
- **is_hidden**: Whether the product is hidden from the public
- **views**: Total views
- **orders**: Total orders
- **created_at**: Date of creation

### 👤 Profiles
User account and role information.
- **id**: Unique identifier (Primary Key)
- **email**: User email
- **full_name**: Full name of the user
- **role**: User role (e.g., Admin)
- **store_id**: Linked to `stores.id`
- **created_at**: Date of creation

### 📝 Applications
Applications submitted by users.
- **id**: Unique identifier (Primary Key)
- **full_name**: Applicant's name
- **phone**: Contact phone number
- **willing_video**: If they are willing to do a video call
- **status**: Application status
- **notes**: Additional notes
- **created_at**: Date of creation

### 📊 Daily Stats
Aggregated daily traffic and interaction data.
- **id**: Unique identifier (Primary Key)
- **store_id**: Linked to `stores.id`
- **stat_date**: The date for the statistics
- **visitors**: Number of visitors on this date
- **wa_clicks**: Number of WhatsApp clicks on this date
- **created_at**: Date of creation

### 📈 Product Daily Stats
Detailed daily performance for individual products.
- **id**: Unique identifier (Primary Key)
- **product_id**: Linked to `products.id`
- **store_id**: Linked to `stores.id`
- **stat_date**: The date for the statistics
- **views**: Number of views on this date
- **orders**: Number of orders on this date
- **created_at**: Date of creation

### 📜 Report Logs
System logs for reporting and errors.
- **id**: Unique identifier (Primary Key)
- **store_id**: Linked to `stores.id`
- **report_date**: Date of the report
- **message**: Log message
- **status**: Log status
- **error**: Error details
- **created_at**: Date of creation

---

## 🔗 Relationships (Foreign Keys)

- `products.store_id` $\rightarrow$ `stores.id`
- `profiles.store_id` $\rightarrow$ `stores.id`
- `daily_stats.store_id` $\rightarrow$ `stores.id`
- `product_daily_stats.product_id` $\rightarrow$ `products.id`
- `product_daily_stats.store_id` $\rightarrow$ `stores.id`
- `report_logs.store_id` $\rightarrow$ `stores.id`
