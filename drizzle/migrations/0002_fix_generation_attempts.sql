-- Fix: rebuild generation_attempts table without preset_id FK to deleted prompt_presets table
-- Strategy: create new table, copy data, drop old, rename

BEGIN;

CREATE TABLE generation_attempts_new (
  id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  post_id integer NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  input_hash text NOT NULL,
  model_id text NOT NULL,
  raw_output text,
  parsed_result text,
  status text NOT NULL CHECK(status IN ('success', 'failed', 'invalid', 'fidelity_rejected')),
  error_code text,
  error_message text,
  created_at integer NOT NULL DEFAULT (unixepoch())
);

INSERT INTO generation_attempts_new
  (id, post_id, input_hash, model_id, raw_output, parsed_result, status, error_code, error_message, created_at)
SELECT
  id, post_id, input_hash, model_id, raw_output, parsed_result, status, error_code, error_message, created_at
FROM generation_attempts;

DROP TABLE generation_attempts;

ALTER TABLE generation_attempts_new RENAME TO generation_attempts;

CREATE INDEX IF NOT EXISTS attempts_post_idx ON generation_attempts(post_id);
CREATE INDEX IF NOT EXISTS attempts_created_idx ON generation_attempts(created_at);
CREATE INDEX IF NOT EXISTS attempts_status_idx ON generation_attempts(status);

COMMIT;
