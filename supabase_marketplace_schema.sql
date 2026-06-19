-- ==========================================
-- EASY EARNING BD: FULL BACKEND DDL SCHEMAS
-- Execute this complete script in the Supabase SQL Editor
-- ==========================================

-- 1. Create Enums for consistent type checks
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'platform_type_enum') THEN
    CREATE TYPE platform_type_enum AS ENUM ('gmail', 'fb', 'insta', 'tiktok', 'whatsapp');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type_enum') THEN
    CREATE TYPE transaction_type_enum AS ENUM (
      'Reward', 
      'Withdrawal_Pending', 
      'Withdrawal_Approved', 
      'Withdrawal_Rejected', 
      'Membership_Upgrade',
      'Verification_Fee_Paid',
      'Referral_Bonus',
      'Account_Sale',
      'Account_Purchase'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'membership_level_enum') THEN
    CREATE TYPE membership_level_enum AS ENUM ('Free', 'Silver', 'Gold', 'Platinum');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'withdrawal_status_enum') THEN
    CREATE TYPE withdrawal_status_enum AS ENUM ('Pending', 'Approved', 'Rejected');
  END IF;
END $$;

-- 2. Construct Tables

-- 'users' lookup
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  username VARCHAR(100) NOT NULL,
  membership_level membership_level_enum NOT NULL DEFAULT 'Free',
  password_hash VARCHAR(128) NOT NULL,
  referral_code VARCHAR(20) UNIQUE NOT NULL,
  referred_by_code VARCHAR(20) REFERENCES users(referral_code) ON DELETE SET NULL,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 'wallets' profile
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  balance_bdt NUMERIC(12, 2) NOT NULL DEFAULT 50.00, -- 50 BDT registration promotion bonus
  total_earned_bdt NUMERIC(12, 2) NOT NULL DEFAULT 50.00,
  total_withdrawn_bdt NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 'tasks' table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  reward_bdt NUMERIC(10, 2) NOT NULL,
  duration_seconds INT NOT NULL DEFAULT 30,
  task_type VARCHAR(50) NOT NULL, -- video, visit, social, survey, quiz
  external_url TEXT,
  category VARCHAR(100),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 'user_tasks' association
CREATE TABLE IF NOT EXISTS user_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reward_earned NUMERIC(10, 2) NOT NULL,
  UNIQUE(user_id, task_id)
);

-- 'withdrawals' ledger
CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_bdt NUMERIC(12, 2) NOT NULL,
  mfs_provider VARCHAR(50) NOT NULL, -- bKash, Nagad, Rocket
  account_number VARCHAR(30) NOT NULL,
  status withdrawal_status_enum NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  reference_id VARCHAR(100)
);

-- 'transactions' tracking ledger
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type transaction_type_enum NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  description TEXT NOT NULL,
  level_generation INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 'marketplace_listings' shop table
CREATE TABLE IF NOT EXISTS marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_username VARCHAR(100) NOT NULL,
  platform_type platform_type_enum NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  account_details TEXT NOT NULL, -- Login credentials/cookies, visible only to buyer upon check success
  price_bdt NUMERIC(12, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'available', -- 'available' or 'sold'
  buyer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Automatic Wallet Placement Trigger
CREATE OR REPLACE FUNCTION on_user_created_init_wallet()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert fresh user wallet (defaulted to 50 Taka signup gift!)
  INSERT INTO wallets (user_id, balance_bdt, total_earned_bdt, total_withdrawn_bdt, updated_at)
  VALUES (NEW.id, 50.00, 50.00, 0.00, NOW());

  -- Ledger initial transaction record
  INSERT INTO transactions (user_id, type, amount, description, created_at)
  VALUES (NEW.id, 'Reward', 50.00, 'New User Registration Greeting Bonus (Promo 50 BDT)', NOW());

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Bind trigger
DROP TRIGGER IF EXISTS user_created_trigger ON users;
CREATE TRIGGER user_created_trigger
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION on_user_created_init_wallet();
