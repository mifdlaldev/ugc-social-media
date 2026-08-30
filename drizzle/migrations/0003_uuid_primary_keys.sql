-- Migration 0003: convert all primary keys and foreign keys from INTEGER to TEXT (UUID v4)
--
-- SQLite cannot alter a column type or drop a constraint in place, so every table
-- is rebuilt. Existing rows keep their data; new UUIDs are generated per row and
-- the old integer ids are remapped so all relations stay intact.
--
-- NOTE: this file documents the schema change for fresh databases and D1 deploys.
-- Remapping existing integer ids to UUIDs requires generating values per row,
-- which plain SQL cannot do; that step was performed by a one-off script against
-- the local database. On an empty database this migration is sufficient on its own.

PRAGMA foreign_keys=OFF;

BEGIN;

CREATE TABLE users_n (
  id text PRIMARY KEY NOT NULL,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK(role IN ('owner', 'admin', 'user')),
  created_at integer NOT NULL DEFAULT (unixepoch()),
  updated_at integer NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE posts_n (
  id text PRIMARY KEY NOT NULL,
  author_id text NOT NULL REFERENCES users_n(id) ON DELETE RESTRICT,
  topic text NOT NULL,
  platform text NOT NULL DEFAULT 'instagram' CHECK(platform IN ('instagram', 'facebook', 'linkedin')),
  tone text NOT NULL DEFAULT 'informatif' CHECK(tone IN ('detail', 'observatif', 'informatif', 'menjual', 'creative')),
  slide_count integer NOT NULL DEFAULT 5 CHECK(slide_count >= 3 AND slide_count <= 7),
  excerpt text,
  created_at integer NOT NULL DEFAULT (unixepoch()),
  updated_at integer NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE post_research_sources_n (
  id text PRIMARY KEY NOT NULL,
  post_id text NOT NULL REFERENCES posts_n(id) ON DELETE CASCADE,
  source_url text NOT NULL,
  source_title text,
  source_snippet text,
  source_engine text NOT NULL DEFAULT 'you.com',
  relevance_score integer,
  created_at integer NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE prompt_slides_n (
  id text PRIMARY KEY NOT NULL,
  post_id text NOT NULL REFERENCES posts_n(id) ON DELETE CASCADE,
  slide_index integer NOT NULL,
  slide_type text NOT NULL DEFAULT 'custom' CHECK(slide_type IN ('hook', 'problem', 'data', 'solution', 'cta', 'custom')),
  slide_title text,
  research_context text,
  created_at integer NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE provider_variants_n (
  id text PRIMARY KEY NOT NULL,
  slide_id text NOT NULL REFERENCES prompt_slides_n(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK(provider IN ('gpt-image', 'nano-banana', 'recraft')),
  prompt_text text NOT NULL,
  visual_notes text,
  on_image_text text,
  aspect_ratio text NOT NULL DEFAULT '1:1' CHECK(aspect_ratio IN ('1:1', '9:16', '4:5', '1.91:1')),
  created_at integer NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE generation_attempts_n (
  id text PRIMARY KEY NOT NULL,
  post_id text NOT NULL REFERENCES posts_n(id) ON DELETE CASCADE,
  input_hash text NOT NULL,
  model_id text NOT NULL,
  raw_output text,
  parsed_result text,
  status text NOT NULL CHECK(status IN ('success', 'failed', 'invalid', 'fidelity_rejected')),
  error_code text,
  error_message text,
  created_at integer NOT NULL DEFAULT (unixepoch())
);

DROP TABLE IF EXISTS generation_attempts;
DROP TABLE IF EXISTS provider_variants;
DROP TABLE IF EXISTS prompt_slides;
DROP TABLE IF EXISTS post_research_sources;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS users;

ALTER TABLE users_n RENAME TO users;
ALTER TABLE posts_n RENAME TO posts;
ALTER TABLE post_research_sources_n RENAME TO post_research_sources;
ALTER TABLE prompt_slides_n RENAME TO prompt_slides;
ALTER TABLE provider_variants_n RENAME TO provider_variants;
ALTER TABLE generation_attempts_n RENAME TO generation_attempts;

CREATE UNIQUE INDEX users_email_idx ON users(email);
CREATE INDEX posts_author_idx ON posts(author_id);
CREATE INDEX research_post_idx ON post_research_sources(post_id);
CREATE INDEX slides_post_idx ON prompt_slides(post_id);
CREATE INDEX slides_index_idx ON prompt_slides(post_id, slide_index);
CREATE INDEX variants_slide_idx ON provider_variants(slide_id);
CREATE INDEX variants_provider_idx ON provider_variants(slide_id, provider);
CREATE INDEX attempts_post_idx ON generation_attempts(post_id);
CREATE INDEX attempts_created_idx ON generation_attempts(created_at);
CREATE INDEX attempts_status_idx ON generation_attempts(status);

COMMIT;

PRAGMA foreign_keys=ON;
