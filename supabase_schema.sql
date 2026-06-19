-- ==========================================
-- Easy Earning BD - Supabase Database Schema
-- Execute this compiled DDL inside your Supabase SQL Editor
-- ==========================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create USERS table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    username VARCHAR(100) NOT NULL,
    membership_level VARCHAR(50) DEFAULT 'Free' CHECK (membership_level IN ('Free', 'Silver', 'Gold', 'Platinum')),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read/update their own profile" 
ON public.users FOR ALL USING (auth.uid() = id);

-- 2. Create TASKS table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    reward_bdt NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    duration_seconds INTEGER NOT NULL DEFAULT 10,
    task_type VARCHAR(50) NOT NULL,
    external_url TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for tasks (Anyone can read active tasks)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active tasks" 
ON public.tasks FOR SELECT USING (active = true);

-- Add some seed data for tasks if wanted
INSERT INTO public.tasks (title, description, reward_bdt, duration_seconds, task_type, external_url, category) 
VALUES 
('Watch bKash App Tutorial', 'Watch the full video tutorial on how to safely transfer money via bKash.', 6.50, 30, 'video', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Video Ad'),
('Visit Nagad Cash Out Guide', 'Read our detailed article containing current Nagad smart cash out tariff indices.', 3.25, 15, 'visit', 'https://example.com/nagad-guide', 'Sponsored Web'),
('Follow Easy Earning BD Official', 'Follow our official community handler for real-time promotion notices.', 4.00, 10, 'social', 'https://facebook.com/easyearningbd', 'Social Media'),
('Discover Freelancing in Bangladesh', 'Learn how microjob microtasks scale your regular supplemental income.', 8.50, 45, 'visit', 'https://example.com/freelancer-bd-blog', 'Sponsored Web'),
('Complete Financial Literacy Quiz', 'Review the basics of smart mobile-banking and avoid fraudulent links.', 10.00, 40, 'quiz', 'https://example.com/quiz-finance', 'Interactive Quiz')
ON CONFLICT DO NOTHING;

-- 3. Create USER_TASKS table (tracks completions)
CREATE TABLE IF NOT EXISTS public.user_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    reward_earned NUMERIC(10, 2) NOT NULL,
    UNIQUE(user_id, task_id) -- Prevent double spend / duplicate reward
);

-- RLS for user_tasks
ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can select/insert their own task records" 
ON public.user_tasks FOR ALL USING (auth.uid() = user_id);

-- 4. Create WALLETS table
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    balance_bdt NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_earned_bdt NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_withdrawn_bdt NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for wallets
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their own wallets" 
ON public.wallets FOR ALL USING (auth.uid() = user_id);

-- 5. Create WITHDRAWALS table
CREATE TABLE IF NOT EXISTS public.withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    amount_bdt NUMERIC(10, 2) NOT NULL,
    mfs_provider VARCHAR(50) NOT NULL CHECK (mfs_provider IN ('bKash', 'Nagad', 'Rocket')),
    account_number VARCHAR(25) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE,
    reference_id VARCHAR(100) DEFAULT ('EEBD-' || UPPER(SUBSTRING(gen_random_uuid()::text from 1 for 8)))
);

-- RLS for withdrawals
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read/create their own withdrawals" 
ON public.withdrawals FOR ALL USING (auth.uid() = user_id);

-- 6. TRANSACTIONS table (ledger)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(50) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own transactions" 
ON public.transactions FOR SELECT USING (auth.uid() = user_id);

-- Trigger to Automatically create a Wallet profile when a User registers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.wallets (user_id, balance_bdt, total_earned_bdt, total_withdrawn_bdt)
  VALUES (new.id, 0.00, 0.00, 0.00);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_user_created
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
