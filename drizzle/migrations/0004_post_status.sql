-- Migration 0004: add owner workflow status (draft / posted to social media)
--
-- post_status tracks whether the owner has already published the carousel to
-- social media. posted_at records when that happened.

ALTER TABLE posts ADD COLUMN post_status text NOT NULL DEFAULT 'draft';
ALTER TABLE posts ADD COLUMN posted_at integer;

CREATE INDEX IF NOT EXISTS posts_status_idx ON posts(post_status);
CREATE INDEX IF NOT EXISTS posts_created_idx ON posts(created_at);
