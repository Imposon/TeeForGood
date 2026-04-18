-- ============================================================
-- TeeForGood Supabase Database Schema
-- Complete setup with tables, relationships, indexes, and RLS
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. USERS TABLE (extends Supabase auth.users)
-- ============================================================
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    charity_id UUID,
    charity_percentage INTEGER NOT NULL DEFAULT 10 CHECK (charity_percentage >= 10 AND charity_percentage <= 100),
    subscription_status TEXT NOT NULL DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'cancelled', 'expired', 'inactive', 'past_due')),
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.users IS 'Extended user profiles linked to Supabase Auth';

-- ============================================================
-- 2. CHARITIES TABLE
-- ============================================================
CREATE TABLE public.charities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    mission_statement TEXT,
    category TEXT NOT NULL,
    logo_url TEXT,
    banner_url TEXT,
    website_url TEXT,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    total_donations_received DECIMAL(12, 2) NOT NULL DEFAULT 0,
    donation_count INTEGER NOT NULL DEFAULT 0,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.charities IS 'Charity organizations users can support';

-- ============================================================
-- 3. SUBSCRIPTIONS TABLE
-- ============================================================
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    stripe_price_id TEXT,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
    status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'past_due', 'incomplete', 'incomplete_expired', 'trialing', 'unpaid')),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    canceled_at TIMESTAMPTZ,
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.subscriptions IS 'Stripe subscription records for users';

-- ============================================================
-- 4. PAYMENTS TABLE
-- ============================================================
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    stripe_payment_intent_id TEXT,
    stripe_invoice_id TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'usd',
    status TEXT NOT NULL CHECK (status IN ('succeeded', 'pending', 'failed', 'canceled')),
    payment_method TEXT,
    receipt_url TEXT,
    failure_message TEXT,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.payments IS 'Payment history for subscriptions and donations';

-- ============================================================
-- 5. SCORES TABLE (Golf Scores)
-- ============================================================
CREATE TABLE public.scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
    course_name TEXT,
    course_location TEXT,
    played_date DATE NOT NULL,
    weather_conditions TEXT,
    notes TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_by UUID REFERENCES public.users(id),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, played_date)
);

COMMENT ON TABLE public.scores IS 'Golf scores submitted by users (last 5 stored)';

-- ============================================================
-- 6. DRAWS TABLE (Monthly Draws)
-- ============================================================
CREATE TABLE public.draws (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    draw_date DATE NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    winning_numbers INTEGER[] NOT NULL,
    total_pool DECIMAL(12, 2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'open', 'closed', 'simulating', 'published', 'completed', 'cancelled')),
    rollover_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    rollover_from UUID REFERENCES public.draws(id),
    entry_count INTEGER NOT NULL DEFAULT 0,
    winner_count INTEGER NOT NULL DEFAULT 0,
    is_simulation BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(year, month)
);

COMMENT ON TABLE public.draws IS 'Monthly lottery draws with winning numbers';

-- ============================================================
-- 7. DRAW ENTRIES TABLE
-- ============================================================
CREATE TABLE public.draw_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    draw_id UUID NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    numbers INTEGER[] NOT NULL,
    matches INTEGER NOT NULL DEFAULT 0,
    match_5 BOOLEAN NOT NULL DEFAULT FALSE,
    match_4 BOOLEAN NOT NULL DEFAULT FALSE,
    match_3 BOOLEAN NOT NULL DEFAULT FALSE,
    prize_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    is_winner BOOLEAN NOT NULL DEFAULT FALSE,
    entry_method TEXT NOT NULL DEFAULT 'random' CHECK (entry_method IN ('random', 'weighted', 'manual')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(draw_id, user_id)
);

COMMENT ON TABLE public.draw_entries IS 'User entries for each draw with their numbers';

-- ============================================================
-- 8. WINNINGS TABLE (Winner Verification)
-- ============================================================
CREATE TABLE public.winnings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    draw_id UUID NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    entry_id UUID NOT NULL REFERENCES public.draw_entries(id) ON DELETE CASCADE,
    prize_amount DECIMAL(10, 2) NOT NULL,
    match_count INTEGER NOT NULL CHECK (match_count >= 3 AND match_count <= 5),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'proof_submitted', 'under_review', 'approved', 'rejected', 'paid', 'expired')),
    proof_image_url TEXT,
    proof_uploaded_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES public.users(id),
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    paid_at TIMESTAMPTZ,
    payment_method TEXT,
    payment_reference TEXT,
    payment_receipt_url TEXT,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.winnings IS 'Winner verification and payment tracking';

-- ============================================================
-- 9. DONATIONS TABLE (Independent Donations)
-- ============================================================
CREATE TABLE public.donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    charity_id UUID NOT NULL REFERENCES public.charities(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'usd',
    is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    message TEXT,
    is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
    recurring_interval TEXT CHECK (recurring_interval IN ('monthly', 'yearly')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    stripe_payment_intent_id TEXT,
    receipt_url TEXT,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.donations IS 'Independent donations to charities';

-- ============================================================
-- 10. USER STATS TABLE (Cached Aggregates)
-- ============================================================
CREATE TABLE public.user_stats (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    total_scores INTEGER NOT NULL DEFAULT 0,
    best_score INTEGER,
    average_score DECIMAL(5, 2),
    total_donations DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total_winnings DECIMAL(12, 2) NOT NULL DEFAULT 0,
    draws_entered INTEGER NOT NULL DEFAULT 0,
    draws_won INTEGER NOT NULL DEFAULT 0,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    last_score_date DATE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.user_stats IS 'Cached user statistics for dashboard';

-- ============================================================
-- 11. ACTIVITY LOGS TABLE (Audit Trail)
-- ============================================================
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.activity_logs IS 'Audit trail for user actions';

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

-- Users indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_charity_id ON public.users(charity_id);
CREATE INDEX idx_users_subscription_status ON public.users(subscription_status);
CREATE INDEX idx_users_role ON public.users(role);

-- Subscriptions indexes
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_period_end ON public.subscriptions(current_period_end);

-- Payments indexes
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_subscription_id ON public.payments(subscription_id);
CREATE INDEX idx_payments_created_at ON public.payments(created_at DESC);

-- Scores indexes
CREATE INDEX idx_scores_user_id ON public.scores(user_id);
CREATE INDEX idx_scores_played_date ON public.scores(played_date DESC);
CREATE INDEX idx_scores_user_date ON public.scores(user_id, played_date DESC);

-- Draws indexes
CREATE INDEX idx_draws_status ON public.draws(status);
CREATE INDEX idx_draws_date ON public.draws(draw_date DESC);
CREATE INDEX idx_draws_month_year ON public.draws(year, month);

-- Draw entries indexes
CREATE INDEX idx_draw_entries_draw_id ON public.draw_entries(draw_id);
CREATE INDEX idx_draw_entries_user_id ON public.draw_entries(user_id);
CREATE INDEX idx_draw_entries_is_winner ON public.draw_entries(is_winner) WHERE is_winner = TRUE;

-- Winnings indexes
CREATE INDEX idx_winnings_user_id ON public.winnings(user_id);
CREATE INDEX idx_winnings_status ON public.winnings(status);
CREATE INDEX idx_winnings_expires_at ON public.winnings(expires_at);

-- Donations indexes
CREATE INDEX idx_donations_user_id ON public.donations(user_id);
CREATE INDEX idx_donations_charity_id ON public.donations(charity_id);
CREATE INDEX idx_donations_paid_at ON public.donations(paid_at DESC);

-- Activity logs indexes
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

-- ============================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draw_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Note: charities and draws are publicly readable

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Users policies
CREATE POLICY "Users can view own profile"
    ON public.users FOR SELECT
    TO authenticated
    USING (auth.uid() = id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable insert during signup"
    ON public.users FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions"
    ON public.subscriptions FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

-- Payments policies
CREATE POLICY "Users can view own payments"
    ON public.payments FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

-- Scores policies
CREATE POLICY "Users can manage own scores"
    ON public.scores FOR ALL
    TO authenticated
    USING (user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (user_id = auth.uid());

-- Draw entries policies
CREATE POLICY "Users can view own entries"
    ON public.draw_entries FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can create own entries"
    ON public.draw_entries FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Winnings policies
CREATE POLICY "Users can view own winnings"
    ON public.winnings FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can update own winnings (proof upload)"
    ON public.winnings FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid() AND status IN ('pending', 'proof_submitted'))
    WITH CHECK (user_id = auth.uid());

-- Donations policies
CREATE POLICY "Users can view own donations"
    ON public.donations FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR is_anonymous = FALSE OR auth.jwt() ->> 'role' = 'admin');

-- User stats policies
CREATE POLICY "Users can view own stats"
    ON public.user_stats FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

-- Activity logs policies
CREATE POLICY "Users can view own activity"
    ON public.activity_logs FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

-- Charities policies (public read, admin write)
CREATE POLICY "Charities are publicly viewable"
    ON public.charities FOR SELECT
    TO anon, authenticated
    USING (is_active = TRUE);

CREATE POLICY "Only admins can modify charities"
    ON public.charities FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Draws policies (public read, admin write)
CREATE POLICY "Draws are publicly viewable"
    ON public.draws FOR SELECT
    TO anon, authenticated
    USING (status IN ('published', 'completed', 'open', 'closed') OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can modify draws"
    ON public.draws FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_charities_updated_at BEFORE UPDATE ON public.charities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scores_updated_at BEFORE UPDATE ON public.scores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_draws_updated_at BEFORE UPDATE ON public.draws
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_draw_entries_updated_at BEFORE UPDATE ON public.draw_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_winnings_updated_at BEFORE UPDATE ON public.winnings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create user profile on signup with charity support
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    charity_uuid UUID;
    charity_pct INTEGER;
BEGIN
    -- Extract charity data from metadata if provided
    charity_uuid := NULLIF(NEW.raw_user_meta_data->>'charity_id', '')::UUID;
    charity_pct := COALESCE((NEW.raw_user_meta_data->>'charity_percentage')::INTEGER, 10);
    
    -- Ensure minimum charity percentage
    IF charity_pct < 10 OR charity_pct > 100 THEN
        charity_pct := 10;
    END IF;
    
    INSERT INTO public.users (
        id, 
        email, 
        first_name, 
        last_name, 
        role, 
        subscription_status,
        charity_id,
        charity_percentage
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        'user',
        'inactive',
        charity_uuid,
        charity_pct
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Limit scores to 5 per user (oldest auto-deleted)
CREATE OR REPLACE FUNCTION limit_user_scores()
RETURNS TRIGGER AS $$
DECLARE
    score_count INTEGER;
    oldest_score_id UUID;
BEGIN
    -- Check if user already has 5 scores
    SELECT COUNT(*) INTO score_count
    FROM public.scores
    WHERE user_id = NEW.user_id;

    -- If at limit, delete oldest
    IF score_count >= 5 THEN
        SELECT id INTO oldest_score_id
        FROM public.scores
        WHERE user_id = NEW.user_id
        ORDER BY played_date ASC
        LIMIT 1;
        
        DELETE FROM public.scores WHERE id = oldest_score_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_score_insert
    BEFORE INSERT ON public.scores
    FOR EACH ROW EXECUTE FUNCTION limit_user_scores();

-- Log activity function
CREATE OR REPLACE FUNCTION log_activity(
    p_user_id UUID,
    p_action TEXT,
    p_entity_type TEXT,
    p_entity_id UUID,
    p_details JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, details)
    VALUES (p_user_id, p_action, p_entity_type, p_entity_id, p_details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- SEED DATA
-- ============================================================

-- Sample charities
INSERT INTO public.charities (name, slug, description, mission_statement, category, is_featured, website_url) VALUES
('Youth Golf Academy', 'youth-golf-academy', 'Teaching underprivileged children golf and life skills through structured programs and mentorship.', 'We believe every child deserves the opportunity to learn golf and the life lessons it teaches. Through our programs, we provide equipment, coaching, and mentorship to youth from underserved communities.', 'Education', TRUE, 'https://youthgolfacademy.org'),

('Green Course Initiative', 'green-course-initiative', 'Sustainable golf course development and environmental conservation for future generations.', 'Promoting environmentally sustainable practices in golf course management. We work with courses to implement water conservation, wildlife protection, and eco-friendly maintenance practices.', 'Environment', TRUE, 'https://greencourse.org'),

('Housing for Heroes', 'housing-for-heroes', 'Building homes for veterans through golf fundraisers and community partnerships.', 'Honoring those who served by providing safe, affordable housing. We organize golf tournaments and events to raise funds for veteran housing projects.', 'Housing', TRUE, 'https://housingforheroes.org'),

('Golf for All', 'golf-for-all', 'Making golf accessible to people with disabilities through adaptive equipment and programs.', 'Breaking down barriers to make golf enjoyable for everyone. We provide adaptive equipment, accessible course modifications, and specialized instruction.', 'Accessibility', FALSE, 'https://golfforall.org'),

('Women in Golf Foundation', 'women-in-golf-foundation', 'Supporting women and girls in golf through scholarships, mentorship, and career development.', 'Empowering the next generation of women in golf. We offer scholarships, networking opportunities, and resources to help women succeed in the golf industry.', 'Equality', FALSE, 'https://womeningolf.org'),

('First Tee Program', 'first-tee-program', 'Building character and life skills through golf for youth across the nation.', 'Using golf as a platform to teach core values like honesty, integrity, and respect. Our curriculum combines golf instruction with character education.', 'Youth Development', TRUE, 'https://firsttee.org'),

('Clean Water Golf', 'clean-water-golf', 'Funding clean water projects in developing countries through golf events and donations.', 'Every round of golf can provide clean water. We organize charity golf events with proceeds funding water purification projects in communities in need.', 'Water', FALSE, 'https://cleanwatergolf.org'),

('Senior Golf Connection', 'senior-golf-connection', 'Keeping seniors active and socially connected through golf programs and events.', 'Golf is a lifetime sport. We create opportunities for seniors to stay active, make friends, and enjoy the game through organized play and social events.', 'Seniors', FALSE, 'https://seniorgolfconnection.org');

-- Create admin user (set password after creation via Supabase dashboard)
-- INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
--     (uuid_generate_v4(), 'admin@teeforgood.com', '{"first_name": "Admin", "last_name": "User", "role": "admin"}'::jsonb);

-- ============================================================
-- COMPLETE - Run this in Supabase SQL Editor
-- ============================================================
