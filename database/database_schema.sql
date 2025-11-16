-- ==============================
-- Aroma Scent — PostgreSQL Schema
-- ==============================

-- Drop old tables (optional safety)
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS products CASCADE;

-- ==============================
-- USERS TABLE
-- ==============================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

-- ==============================
-- PRODUCTS TABLE
-- ==============================
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  tag VARCHAR(50),
  rating NUMERIC(3,1),
  image TEXT NOT NULL,
  description TEXT
);
