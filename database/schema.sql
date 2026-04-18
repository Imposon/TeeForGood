-- TeeForGood Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  charity_id UUID REFERENCES charities(id),
  charity_percentage INTEGER DEFAULT 10 CHECK (charity_percentage >= 10 AND charity_percentage <= 100),
  subscription_status VARCHAR(20) DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'cancelled', 'expired', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  plan_type VARCHAR(20) CHECK (plan_type IN ('monthly', 'yearly')),
  status VARCHAR(20) CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  stripe_payment_intent_id VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) CHECK (status IN ('succeeded', 'pending', 'failed')),
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Golf scores table (last 5 only - enforced by application logic)
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
  course_name VARCHAR(255),
  played_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, played_date)
);

-- Charities table
CREATE TABLE charities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo_url VARCHAR(500),
  website VARCHAR(255),
  category VARCHAR(100),
  is_featured BOOLEAN DEFAULT FALSE,
  total_donations_received DECIMAL(12, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Monthly draws table
CREATE TABLE draws (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_date DATE NOT NULL,
  winning_numbers INTEGER[] NOT NULL,
  total_pool DECIMAL(12, 2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'simulating', 'published', 'completed')),
  rollover_amount DECIMAL(12, 2) DEFAULT 0,
  is_simulation BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Draw entries table
CREATE TABLE draw_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id UUID REFERENCES draws(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  numbers INTEGER[] NOT NULL,
  matches INTEGER DEFAULT 0,
  prize_amount DECIMAL(10, 2) DEFAULT 0,
  is_winner BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(draw_id, user_id)
);

-- Winners table with verification
CREATE TABLE winners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id UUID REFERENCES draws(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  entry_id UUID REFERENCES draw_entries(id) ON DELETE CASCADE,
  prize_amount DECIMAL(10, 2) NOT NULL,
  match_count INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  proof_image_url VARCHAR(500),
  proof_uploaded_at TIMESTAMP WITH TIME ZONE,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES users(id),
  paid_at TIMESTAMP WITH TIME ZONE,
  payment_method VARCHAR(50),
  payment_reference VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Donations table (independent donations)
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  charity_id UUID REFERENCES charities(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  is_anonymous BOOLEAN DEFAULT FALSE,
  message TEXT,
  payment_status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription_status ON users(subscription_status);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX idx_scores_user_id ON scores(user_id);
CREATE INDEX idx_scores_user_date ON scores(user_id, played_date);
CREATE INDEX idx_draw_entries_draw_id ON draw_entries(draw_id);
CREATE INDEX idx_draw_entries_user_id ON draw_entries(user_id);
CREATE INDEX idx_winners_draw_id ON winners(draw_id);
CREATE INDEX idx_winners_status ON winners(status);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_winners_updated_at BEFORE UPDATE ON winners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY users_policy ON users
  FOR ALL USING (id = auth.uid() OR role = 'admin');

CREATE POLICY subscriptions_policy ON subscriptions
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY payments_policy ON payments
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY scores_policy ON scores
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY draw_entries_policy ON draw_entries
  FOR ALL USING (user_id = auth.uid());

-- Insert sample charities
INSERT INTO charities (name, description, category, is_featured) VALUES
('Youth Golf Academy', 'Teaching underprivileged children golf and life skills', 'Education', TRUE),
('Green Course Initiative', 'Sustainable golf course development and environmental conservation', 'Environment', TRUE),
('Housing for Heroes', 'Building homes for veterans through golf fundraisers', 'Housing', TRUE),
('Golf for All', 'Making golf accessible to people with disabilities', 'Accessibility', FALSE),
('Women in Golf Foundation', 'Supporting women and girls in golf', 'Equality', FALSE);
