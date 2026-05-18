-- ProfitScope Database Schema
-- Run this in your Supabase SQL Editor

-- 1. Create the projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_address TEXT NOT NULL,
  trade TEXT NOT NULL CHECK (trade IN ('plumber', 'electrician', 'carpenter', 'hvac', 'general')),
  hourly_rate DECIMAL(10, 2) NOT NULL,
  estimated_hours DECIMAL(10, 2) NOT NULL,
  actual_hours DECIMAL(10, 2),
  material_cost DECIMAL(10, 2) DEFAULT 0,
  subcontractor_cost DECIMAL(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'completed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Users can only see their own projects
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own projects
CREATE POLICY "Users can create their own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own projects
CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own projects
CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. Index for faster queries
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

-- 6. Subscriptions table (Creem webhook)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_subscription_id TEXT UNIQUE NOT NULL,
  provider TEXT NOT NULL DEFAULT 'creem',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_email TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('trialing', 'active', 'paused', 'cancelled', 'expired')),
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Service role can manage subscriptions (used by webhook)
CREATE POLICY "Service role can manage subscriptions"
  ON subscriptions
  USING (true)
  WITH CHECK (true);

-- Authenticated users can read their own subscription
CREATE POLICY "Users can view their own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX idx_subscriptions_provider_id ON subscriptions(provider_subscription_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_customer_email ON subscriptions(customer_email);

-- Migration for existing table (run if upgrading from PayPal schema):
-- ALTER TABLE subscriptions RENAME COLUMN paypal_subscription_id TO provider_subscription_id;
-- ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'paypal';
-- ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
-- ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS customer_email TEXT;
-- ALTER TABLE subscriptions DROP COLUMN IF EXISTS payer_id;
-- ALTER TABLE subscriptions DROP COLUMN IF EXISTS paypal_email;
-- ALTER TABLE subscriptions DROP COLUMN IF EXISTS plan_id;
-- ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;
-- ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_status_check CHECK (status IN ('trialing', 'active', 'paused', 'cancelled', 'expired'));
-- DROP INDEX IF EXISTS idx_subscriptions_paypal_id;
-- CREATE INDEX IF NOT EXISTS idx_subscriptions_provider_id ON subscriptions(provider_subscription_id);
-- CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_email ON subscriptions(customer_email);

-- 7. Payment events log
CREATE TABLE IF NOT EXISTS payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  provider TEXT DEFAULT 'creem',
  provider_event_id TEXT,
  resource_id TEXT,
  raw_body TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage payment_events"
  ON payment_events
  USING (true)
  WITH CHECK (true);
