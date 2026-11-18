-- Apply in the PRIVATE Cloudflare D1 database bound to Pages as RECORDS_DB.
-- No artist, financial, or contract rows belong in the public GitHub JSON files.
PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS records_roles (
 email TEXT PRIMARY KEY COLLATE NOCASE,
 role TEXT NOT NULL CHECK(role IN ('director','ar','production','finance','artist')),
 enabled INTEGER NOT NULL DEFAULT 1 CHECK(enabled IN (0,1))
);
CREATE TABLE IF NOT EXISTS records_artists (
 id TEXT PRIMARY KEY,
 stage TEXT NOT NULL DEFAULT 'application' CHECK(stage IN ('application','review','negotiation','contract','production','release','active','closed')),
 stage_name TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS records_agreements (
 id TEXT PRIMARY KEY,
 artist_id TEXT NOT NULL REFERENCES records_artists(id),
 kind TEXT NOT NULL CHECK(kind IN ('recording','master_license','distribution','development')),
 status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','legal_review','awaiting_provider','completed_verified','cancelled')),
 provider TEXT,
 provider_envelope_id TEXT,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS records_royalties (
 id TEXT PRIMARY KEY,
 artist_id TEXT NOT NULL REFERENCES records_artists(id),
 reference TEXT NOT NULL,
 currency TEXT NOT NULL CHECK(currency IN ('EUR','USD','GBP')),
 gross_cents INTEGER NOT NULL CHECK(gross_cents>=0),
 permitted_deductions_cents INTEGER NOT NULL CHECK(permitted_deductions_cents>=0),
 basis_points INTEGER NOT NULL CHECK(basis_points BETWEEN 0 AND 10000),
 payable_cents INTEGER NOT NULL CHECK(payable_cents>=0),
 status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','approved','paid')),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS records_audit (
 id TEXT PRIMARY KEY,
 actor_email TEXT NOT NULL,
 action TEXT NOT NULL,
 object_type TEXT NOT NULL,
 object_id TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_records_artist_stage ON records_artists(stage);
CREATE INDEX IF NOT EXISTS ix_records_agreement_artist ON records_agreements(artist_id);
CREATE INDEX IF NOT EXISTS ix_records_royalty_artist ON records_royalties(artist_id);
-- Director bootstrap (run manually in D1 after configuring Access):
-- INSERT INTO records_roles(email,role,enabled) VALUES('DIRECTOR_EMAIL_HERE','director',1);
