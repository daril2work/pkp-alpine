-- Drop existing types and tables to ensure a clean slate
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS verification_status CASCADE;
DROP TYPE IF EXISTS quarter_enum CASCADE;
DROP TABLE IF EXISTS indicator_progress CASCADE;
DROP TABLE IF EXISTS quarterly_evaluation CASCADE;
DROP TABLE IF EXISTS bundle_assignments CASCADE;
DROP TABLE IF EXISTS indicators CASCADE;
DROP TABLE IF EXISTS clusters CASCADE;
DROP TABLE IF EXISTS bundles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS puskesmas CASCADE;

-- Enable pgcrypto for gen_random_uuid() if not enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- PUSKESMAS & BUNDLE CONFIGURATION
CREATE TABLE puskesmas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    region TEXT
);

-- USER MANAGEMENT
CREATE TYPE user_role AS ENUM ('dinkes', 'puskesmas');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    puskesmas_id UUID REFERENCES puskesmas(id) ON DELETE SET NULL, -- Nullable for dinkes users
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE bundles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    year INTEGER NOT NULL,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(name, year)
);

CREATE TABLE clusters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bundle_id UUID REFERENCES bundles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    "order" INTEGER
);

CREATE TABLE indicators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cluster_id UUID REFERENCES clusters(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_value REAL,
    unit TEXT,
    "order" INTEGER
);

CREATE TABLE bundle_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bundle_id UUID REFERENCES bundles(id) ON DELETE CASCADE,
    puskesmas_id UUID REFERENCES puskesmas(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(bundle_id, puskesmas_id)
);

-- DATA REPORTING & VERIFICATION
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE indicator_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    indicator_id UUID REFERENCES indicators(id) ON DELETE CASCADE,
    puskesmas_id UUID REFERENCES puskesmas(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    value REAL,
    note TEXT,
    status verification_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now(),
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    verification_note TEXT,
    UNIQUE(indicator_id, puskesmas_id, year, month)
);

-- EVALUATION (can be expanded later)
CREATE TYPE quarter_enum AS ENUM ('Q1', 'Q2', 'Q3', 'Q4');

CREATE TABLE quarterly_evaluation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bundle_id UUID REFERENCES bundles(id) ON DELETE CASCADE,
    puskesmas_id UUID REFERENCES puskesmas(id) ON DELETE CASCADE,
    quarter quarter_enum,
    year INTEGER,
    evaluation TEXT, -- Rencana Tindak Lanjut
    rtl TEXT, -- Rencana Tindak Lanjut
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(bundle_id, puskesmas_id, year, quarter)
);

-- Add indexes for frequently queried columns
CREATE INDEX ON users (email);
CREATE INDEX ON users (puskesmas_id);
CREATE INDEX ON bundle_assignments (puskesmas_id);
CREATE INDEX ON indicator_progress (puskesmas_id, year);