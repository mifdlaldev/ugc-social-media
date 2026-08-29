-- Migration: social_media_revamp
-- Removes article-based content model, adds social media post model

-- Drop old tables (cascade removes all data)
DROP TABLE IF EXISTS post_tags;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS post_categories;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS prompt_presets;

-- Drop old columns from posts
ALTER TABLE posts DROP COLUMN title;
ALTER TABLE posts DROP COLUMN slug;
ALTER TABLE posts DROP COLUMN article_body;

-- Add new columns to posts
ALTER TABLE posts ADD COLUMN topic text NOT NULL DEFAULT 'Untitled';
ALTER TABLE posts ADD COLUMN platform text NOT NULL DEFAULT 'instagram' CHECK(platform IN ('instagram', 'facebook', 'linkedin'));
ALTER TABLE posts ADD COLUMN tone text NOT NULL DEFAULT 'informatif' CHECK(tone IN ('detail', 'observatif', 'informatif', 'menjual', 'creative'));
ALTER TABLE posts ADD COLUMN slide_count integer NOT NULL DEFAULT 5 CHECK(slide_count >= 3 AND slide_count <= 7);

-- Create new tables
CREATE TABLE post_research_sources (
	id integer PRIMARY KEY AUTOINCREMENT,
	post_id integer NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
	source_url text NOT NULL,
	source_title text,
	source_snippet text,
	source_engine text NOT NULL DEFAULT 'you.com',
	relevance_score integer,
	created_at integer NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX research_post_idx ON post_research_sources(post_id);

CREATE TABLE prompt_slides (
	id integer PRIMARY KEY AUTOINCREMENT,
	post_id integer NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
	slide_index integer NOT NULL,
	slide_type text NOT NULL DEFAULT 'custom' CHECK(slide_type IN ('hook', 'problem', 'data', 'solution', 'cta', 'custom')),
	slide_title text,
	research_context text,
	created_at integer NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX slides_post_idx ON prompt_slides(post_id);
CREATE INDEX slides_index_idx ON prompt_slides(post_id, slide_index);

CREATE TABLE provider_variants (
	id integer PRIMARY KEY AUTOINCREMENT,
	slide_id integer NOT NULL REFERENCES prompt_slides(id) ON DELETE CASCADE,
	provider text NOT NULL CHECK(provider IN ('gpt-image', 'nano-banana', 'recraft')),
	prompt_text text NOT NULL,
	visual_notes text,
	on_image_text text,
	aspect_ratio text NOT NULL DEFAULT '1:1' CHECK(aspect_ratio IN ('1:1', '9:16', '4:5', '1.91:1')),
	created_at integer NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX variants_slide_idx ON provider_variants(slide_id);
CREATE INDEX variants_provider_idx ON provider_variants(slide_id, provider);