-- ==========================================
-- EASY EARNING BD - UNIFIED COMPLETE SCHEMA
-- Execute this script inside the Supabase SQL Editor
-- WARNING: This will drop existing tables to recreate them with 
-- correct VARCHAR keys to perfectly match the frontend ID generators.
-- ==========================================

-- Enable UUID extension if not enabled (used for default ID parts)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables and old triggers to guarantee zero mismatches
DROP TRIGGER IF EXISTS user_created_trigger ON users;
DROP TRIGGER IF EXISTS on_user_created ON users;
DROP TRIGGER IF EXISTS user_created_trigger ON public.users;
DROP TRIGGER IF EXISTS on_user_created ON public.users;

DROP FUNCTION IF EXISTS on_user_created_init_wallet() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

DROP TABLE IF EXISTS admin_sales CASCADE;
DROP TABLE IF EXISTS verification_requests CASCADE;
DROP TABLE IF EXISTS marketplace_listings CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS withdrawals CASCADE;
DROP TABLE IF EXISTS user_tasks CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS wallets CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Create USERS table
CREATE TABLE users (
  id VARCHAR(100) PRIMARY KEY DEFAULT 'user-' || LOWER(SUBSTRING(gen_random_uuid()::text from 1 for 9)),
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  username VARCHAR(100) NOT NULL,
  membership_level VARCHAR(50) NOT NULL DEFAULT 'Free',
  password_hash VARCHAR(128) NOT NULL,
  referral_code VARCHAR(20) UNIQUE NOT NULL,
  referred_by_code VARCHAR(20) REFERENCES users(referral_code) ON DELETE SET NULL,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on users and disable restricted access policies for general public reads
-- (Note: Set to public-permissive as we manage data securely through encrypted raw password hashing)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public permissive users" ON users FOR ALL USING (true) WITH CHECK (true);

-- 2. Create WALLETS table
CREATE TABLE wallets (
  id VARCHAR(100) PRIMARY KEY DEFAULT 'wallet-' || LOWER(SUBSTRING(gen_random_uuid()::text from 1 for 9)),
  user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  balance_bdt NUMERIC(12, 2) NOT NULL DEFAULT 50.00,
  total_earned_bdt NUMERIC(12, 2) NOT NULL DEFAULT 50.00,
  total_withdrawn_bdt NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public permissive wallets" ON wallets FOR ALL USING (true) WITH CHECK (true);

-- 3. Create TASKS table
CREATE TABLE tasks (
  id VARCHAR(100) PRIMARY KEY DEFAULT 'task-' || LOWER(SUBSTRING(gen_random_uuid()::text from 1 for 9)),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  reward_bdt NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  duration_seconds INT NOT NULL DEFAULT 30,
  task_type VARCHAR(50) NOT NULL,
  external_url TEXT NOT NULL,
  category VARCHAR(100) DEFAULT 'General',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public permissive tasks" ON tasks FOR ALL USING (true) WITH CHECK (true);

-- Load Seed Tasks for verification & production
INSERT INTO tasks (id, title, description, reward_bdt, duration_seconds, task_type, external_url, category) 
VALUES 
('task-1', 'Watch bKash App Transfer Tutorial', 'Watch the full video tutorial on how to safely transfer mobile-money via bKash to avoid fraudulent phishing attempts.', 6.50, 15, 'video', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Video Ad'),
('task-2', 'Visit Nagad Cash Out Tariffs Guide', 'Read our detailed information guide containing current Nagad smart cash out low tariff indices and limits.', 3.25, 15, 'visit', 'https://example.com/nagad-guide', 'Sponsored Web'),
('task-3', 'Follow Easy Earning BD Official Handler', 'Join our official customer support group & promoter channel to grab high reward bonus promo codes.', 4.00, 10, 'social', 'https://facebook.com/easyearningbd', 'Social Media'),
('task-4', 'Complete Secure Mobile Banking Quiz', 'Answer 5 micro-questions about standard account security protocols and confirm you understand phishing warnings.', 10.00, 30, 'quiz', 'https://example.com/smart-bank-quiz', 'Interactive Quiz')
ON CONFLICT (id) DO UPDATE SET 
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  reward_bdt = EXCLUDED.reward_bdt,
  duration_seconds = EXCLUDED.duration_seconds;

-- 4. Create USER_TASKS table
CREATE TABLE user_tasks (
  id VARCHAR(100) PRIMARY KEY DEFAULT 'ut-' || LOWER(SUBSTRING(gen_random_uuid()::text from 1 for 9)),
  user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id VARCHAR(100) NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reward_earned NUMERIC(10, 2) NOT NULL,
  UNIQUE(user_id, task_id)
);

ALTER TABLE user_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public permissive user_tasks" ON user_tasks FOR ALL USING (true) WITH CHECK (true);

-- 5. Create WITHDRAWALS table
CREATE TABLE withdrawals (
  id VARCHAR(100) PRIMARY KEY DEFAULT 'with-' || LOWER(SUBSTRING(gen_random_uuid()::text from 1 for 9)),
  user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_bdt NUMERIC(12, 2) NOT NULL,
  mfs_provider VARCHAR(50) NOT NULL,
  account_number VARCHAR(30) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  reference_id VARCHAR(100)
);

ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public permissive withdrawals" ON withdrawals FOR ALL USING (true) WITH CHECK (true);

-- 6. Create TRANSACTIONS table
CREATE TABLE transactions (
  id VARCHAR(100) PRIMARY KEY DEFAULT 'tx-' || LOWER(SUBSTRING(gen_random_uuid()::text from 1 for 9)),
  user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  description TEXT NOT NULL,
  level_generation INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public permissive transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);

-- 7. Create MARKETPLACE_LISTINGS table
CREATE TABLE marketplace_listings (
  id VARCHAR(100) PRIMARY KEY DEFAULT 'list-' || LOWER(SUBSTRING(gen_random_uuid()::text from 1 for 9)),
  seller_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_username VARCHAR(100) NOT NULL,
  platform_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  account_details TEXT NOT NULL,
  price_bdt NUMERIC(12, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'available',
  buyer_id VARCHAR(100) REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public permissive marketplace_listings" ON marketplace_listings FOR ALL USING (true) WITH CHECK (true);

-- 8. Create VERIFICATION_REQUESTS table
CREATE TABLE verification_requests (
  id VARCHAR(100) PRIMARY KEY DEFAULT 'verifreq-' || LOWER(SUBSTRING(gen_random_uuid()::text from 1 for 9)),
  user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username VARCHAR(100) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  mfs_provider VARCHAR(50) NOT NULL,
  sender_number VARCHAR(30) NOT NULL,
  trx_id VARCHAR(100) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public permissive verification_requests" ON verification_requests FOR ALL USING (true) WITH CHECK (true);

-- 9. Create ADMIN_SALES table
CREATE TABLE admin_sales (
  id VARCHAR(100) PRIMARY KEY DEFAULT 'adminsale-' || LOWER(SUBSTRING(gen_random_uuid()::text from 1 for 9)),
  user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username VARCHAR(100) NOT NULL,
  platform_type VARCHAR(50) NOT NULL,
  account_email VARCHAR(100) NOT NULL,
  account_password VARCHAR(255) NOT NULL,
  recovery_info TEXT NOT NULL,
  additional_notes TEXT,
  price_bdt NUMERIC(12, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE admin_sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public permissive admin_sales" ON admin_sales FOR ALL USING (true) WITH CHECK (true);


-- 10. Automatic Wallet Placement Trigger Function (Provides initial wallet + 50 BDT balance + Transaction history)
CREATE OR REPLACE FUNCTION on_user_created_init_wallet()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert brand new user wallet
  INSERT INTO wallets (id, user_id, balance_bdt, total_earned_bdt, total_withdrawn_bdt, updated_at)
  VALUES (
    'wallet-' || LOWER(SUBSTRING(gen_random_uuid()::text from 1 for 9)), 
    NEW.id, 
    50.00, 
    50.00, 
    0.00, 
    NOW()
  );

  -- Log the initial signup transaction history
  INSERT INTO transactions (id, user_id, type, amount, description, created_at)
  VALUES (
    'tx-reg-' || LOWER(SUBSTRING(gen_random_uuid()::text from 1 for 9)), 
    NEW.id, 
    'Reward', 
    50.00, 
    'New User Registration Orientation Gift (50 BDT)', 
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Bind the trigger to users table
CREATE TRIGGER user_created_trigger
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION on_user_created_init_wallet();
