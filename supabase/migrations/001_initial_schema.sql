-- LegalDrop — Full Schema (Phase 0)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUMS
CREATE TYPE user_role          AS ENUM ('client','lawyer','admin');
CREATE TYPE case_status        AS ENUM ('draft','pending_review','open','assigned','closed','disputed');
CREATE TYPE case_category      AS ENUM ('landlord','consumer','contract','employment','family','other');
CREATE TYPE bid_status         AS ENUM ('submitted','accepted','rejected','withdrawn');
CREATE TYPE transaction_status AS ENUM ('escrow','released','refunded');

-- PROFILES
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  role        user_role NOT NULL DEFAULT 'client',
  full_name   TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- LAWYER PROFILES
CREATE TABLE lawyer_profiles (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  bar_number        TEXT NOT NULL,
  jurisdictions     TEXT[] NOT NULL DEFAULT '{}',
  specialties       TEXT[] NOT NULL DEFAULT '{}',
  bio               TEXT,
  stripe_account_id TEXT,
  is_verified       BOOLEAN NOT NULL DEFAULT FALSE,
  id_document_url   TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CASES
CREATE TABLE cases (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id              UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  original_description   TEXT NOT NULL,
  anonymized_description TEXT,
  category               case_category NOT NULL,
  jurisdiction           TEXT NOT NULL,
  budget_min             NUMERIC(10,2) NOT NULL,
  budget_max             NUMERIC(10,2) NOT NULL,
  status                 case_status NOT NULL DEFAULT 'draft',
  is_anonymous           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT budget_valid CHECK (budget_max >= budget_min)
);

-- BIDS
CREATE TABLE bids (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id          UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  lawyer_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  price            NUMERIC(10,2) NOT NULL,
  cover_letter     TEXT NOT NULL,
  turnaround_hours INTEGER NOT NULL,
  status           bid_status NOT NULL DEFAULT 'submitted',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(case_id, lawyer_id)
);

-- TRANSACTIONS
CREATE TABLE transactions (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id                  UUID NOT NULL REFERENCES cases(id),
  bid_id                   UUID REFERENCES bids(id),
  amount                   NUMERIC(10,2) NOT NULL,
  fee                      NUMERIC(10,2) NOT NULL,
  net_lawyer               NUMERIC(10,2) NOT NULL,
  status                   transaction_status NOT NULL DEFAULT 'escrow',
  stripe_payment_intent_id TEXT,
  stripe_transfer_id       TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- REVIEWS
CREATE TABLE reviews (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id    UUID NOT NULL REFERENCES cases(id) UNIQUE,
  client_id  UUID NOT NULL REFERENCES profiles(id),
  lawyer_id  UUID NOT NULL REFERENCES profiles(id),
  rating     INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- MESSAGES
CREATE TABLE messages (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id    UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  sender_id  UUID NOT NULL REFERENCES profiles(id),
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ADMIN NOTIFICATIONS
CREATE TABLE admin_notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type       TEXT NOT NULL,
  payload    JSONB,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TRIGGERS: updated_at
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_upd     BEFORE UPDATE ON profiles          FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_cases_upd        BEFORE UPDATE ON cases             FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_bids_upd         BEFORE UPDATE ON bids              FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_transactions_upd BEFORE UPDATE ON transactions      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_lp_upd           BEFORE UPDATE ON lawyer_profiles   FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- TRIGGER: auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, role, full_name)
  VALUES (
    NEW.id, NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'client'),
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ROW LEVEL SECURITY
ALTER TABLE profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE lawyer_profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases               ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids                ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews             ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages            ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_lawyer() RETURNS BOOLEAN AS $$
  SELECT EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'lawyer');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- PROFILES
CREATE POLICY "own_select"   ON profiles FOR SELECT USING (id = auth.uid() OR is_admin());
CREATE POLICY "own_update"   ON profiles FOR UPDATE USING (id = auth.uid());

-- LAWYER PROFILES
CREATE POLICY "lp_own"       ON lawyer_profiles FOR ALL USING (profile_id = auth.uid());
CREATE POLICY "lp_admin"     ON lawyer_profiles FOR ALL USING (is_admin());
CREATE POLICY "lp_pub"       ON lawyer_profiles FOR SELECT USING (is_verified = TRUE);

-- CASES
CREATE POLICY "c_client_sel" ON cases FOR SELECT USING (client_id = auth.uid() OR is_admin());
CREATE POLICY "c_client_ins" ON cases FOR INSERT WITH CHECK (client_id = auth.uid());
CREATE POLICY "c_client_upd" ON cases FOR UPDATE USING (client_id = auth.uid() AND status IN ('draft','pending_review'));
CREATE POLICY "c_lawyer_sel" ON cases FOR SELECT USING (
  is_lawyer() AND (status = 'open' OR EXISTS(SELECT 1 FROM bids WHERE bids.case_id = cases.id AND bids.lawyer_id = auth.uid()))
);

-- BIDS
CREATE POLICY "b_lawyer"     ON bids FOR ALL USING (lawyer_id = auth.uid());
CREATE POLICY "b_client"     ON bids FOR SELECT USING (EXISTS(SELECT 1 FROM cases WHERE cases.id = bids.case_id AND cases.client_id = auth.uid()));
CREATE POLICY "b_admin"      ON bids FOR ALL USING (is_admin());

-- TRANSACTIONS
CREATE POLICY "t_party"      ON transactions FOR SELECT USING (
  is_admin()
  OR EXISTS(SELECT 1 FROM cases  WHERE cases.id = transactions.case_id AND cases.client_id = auth.uid())
  OR EXISTS(SELECT 1 FROM bids   WHERE bids.id  = transactions.bid_id  AND bids.lawyer_id  = auth.uid())
);

-- REVIEWS
CREATE POLICY "r_insert"     ON reviews FOR INSERT WITH CHECK (client_id = auth.uid());
CREATE POLICY "r_select"     ON reviews FOR SELECT USING (TRUE);

-- MESSAGES
CREATE POLICY "m_party"      ON messages FOR ALL USING (
  sender_id = auth.uid()
  OR EXISTS(SELECT 1 FROM cases c LEFT JOIN bids b ON b.case_id=c.id AND b.status='accepted'
    WHERE c.id=messages.case_id AND (c.client_id=auth.uid() OR b.lawyer_id=auth.uid()))
);

-- ADMIN NOTIFS
CREATE POLICY "an_admin"     ON admin_notifications FOR ALL USING (is_admin());
