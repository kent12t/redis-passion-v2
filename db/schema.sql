-- Run once against your Neon database.
CREATE TABLE IF NOT EXISTS activity_record (
  id          BIGSERIAL PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  personality TEXT,
  session_id  TEXT,
  completed   BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS activity_record_session_id_idx ON activity_record (session_id);
