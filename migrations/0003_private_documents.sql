-- Storage metadata only. The PDF itself belongs in PRIVATE R2, never in GitHub or Pages assets.
CREATE TABLE IF NOT EXISTS records_private_documents (
 id TEXT PRIMARY KEY,
 agreement_id TEXT NOT NULL REFERENCES records_agreements(id),
 object_key TEXT NOT NULL UNIQUE,
 original_name TEXT NOT NULL,
 media_type TEXT NOT NULL CHECK(media_type='application/pdf'),
 sha256 TEXT NOT NULL CHECK(length(sha256)=64),
 size_bytes INTEGER NOT NULL CHECK(size_bytes>0 AND size_bytes<=8388608),
 uploaded_by TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_records_private_documents_agreement ON records_private_documents(agreement_id);
