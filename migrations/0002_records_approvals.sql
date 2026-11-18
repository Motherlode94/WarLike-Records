-- Records Admin phase 2: approval trails, separated duties, and signature evidence.
-- Run once after 0001_records_admin.sql, against the dedicated private D1 database.
ALTER TABLE records_royalties ADD COLUMN created_by TEXT NOT NULL DEFAULT 'legacy';
ALTER TABLE records_royalties ADD COLUMN approved_by TEXT;
ALTER TABLE records_royalties ADD COLUMN approved_at TEXT;
ALTER TABLE records_royalties ADD COLUMN contract_reference TEXT;
ALTER TABLE records_royalties ADD COLUMN statement_period TEXT;
CREATE TABLE IF NOT EXISTS records_royalty_events (
 id TEXT PRIMARY KEY,
 royalty_id TEXT NOT NULL REFERENCES records_royalties(id),
 actor_email TEXT NOT NULL,
 event TEXT NOT NULL CHECK(event IN ('draft_created','draft_approved','draft_rejected')),
 details TEXT NOT NULL DEFAULT '{}',
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS records_signature_evidence (
 id TEXT PRIMARY KEY,
 agreement_id TEXT NOT NULL REFERENCES records_agreements(id),
 provider TEXT NOT NULL,
 provider_envelope_id TEXT NOT NULL,
 document_sha256 TEXT NOT NULL CHECK(length(document_sha256)=64),
 verification_status TEXT NOT NULL DEFAULT 'pending' CHECK(verification_status IN ('pending','verified','rejected')),
 evidence_object_key TEXT,
 verified_at TEXT,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(provider,provider_envelope_id)
);
CREATE INDEX IF NOT EXISTS idx_royalty_events_royalty ON records_royalty_events(royalty_id);
CREATE INDEX IF NOT EXISTS idx_signature_evidence_agreement ON records_signature_evidence(agreement_id);
-- IMPORTANT: No service in this migration can assert "signed".
-- Provider integration must verify cryptographic evidence and document hashes.
