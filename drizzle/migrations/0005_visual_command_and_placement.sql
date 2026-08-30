-- Migration 0005: replace posts.platform with posts.platform_placement and
-- posts.tone with posts.visual_command.
--
-- Both column replacements land in ONE table rebuild. SQLite cannot alter a
-- column's CHECK constraint in place, and rebuilding the posts table twice in
-- sequence would be needlessly risky.
--
-- platform -> platform_placement: a platform name does not identify a placement.
--   The 13 allowed values, their exact canvases, and their source provenance are
--   recorded in docs/platform-image-size-reference.md and mirrored in
--   src/lib/server/platformPlacements.ts.
--
-- tone -> visual_command: tone described a manner of speaking and did not
--   determine visual form. The 18 allowed values come verbatim from
--   docs/prompt-command-reference.md and are mirrored in
--   src/lib/server/visualCommands.ts.
--
-- Legacy value mapping (for any database that still holds rows):
--   platform 'instagram' (was 1:1)    -> 'instagram-feed-square'
--   platform 'facebook'  (was 4:5)    -> 'facebook-feed-portrait'
--   platform 'linkedin'  (was 1.91:1) -> 'linkedin-single-image-landscape'
--   every tone value                  -> '/infographic'
-- The platform mapping preserves the aspect ratio each post effectively had
-- under the previous ASPECT_BY_PLATFORM lookup. Tone has no visual equivalent,
-- so it maps to the neutral default rather than to a guessed command.

PRAGMA foreign_keys=OFF;

BEGIN;

CREATE TABLE posts_n (
  id text PRIMARY KEY NOT NULL,
  author_id text NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  topic text NOT NULL,
  platform_placement text NOT NULL DEFAULT 'instagram-feed-portrait' CHECK(platform_placement IN (
    'instagram-feed-square',
    'instagram-feed-portrait',
    'instagram-feed-landscape',
    'instagram-stories',
    'facebook-feed-square',
    'facebook-feed-portrait',
    'facebook-stories',
    'x-instream-single-image',
    'youtube-community-image',
    'linkedin-single-image-portrait',
    'linkedin-single-image-square',
    'linkedin-single-image-landscape',
    'pinterest-standard-pin'
  )),
  visual_command text NOT NULL DEFAULT '/infographic' CHECK(visual_command IN (
    '/infographic',
    '/scientificdiagram',
    '/diagram',
    '/schematic',
    '/flowchart',
    '/process',
    '/comparison',
    '/timeline',
    '/conceptmap',
    '/anatomy',
    '/blueprint',
    '/isometric',
    '/explodedview',
    '/cutaway',
    '/crosssection',
    '/layers',
    '/scale',
    '/handwrittennotes'
  )),
  slide_count integer NOT NULL DEFAULT 5 CHECK(slide_count >= 3 AND slide_count <= 7),
  excerpt text,
  post_status text NOT NULL DEFAULT 'draft' CHECK(post_status IN ('draft', 'posted')),
  posted_at integer,
  created_at integer NOT NULL DEFAULT (unixepoch()),
  updated_at integer NOT NULL DEFAULT (unixepoch())
);

INSERT INTO posts_n (
  id, author_id, topic, platform_placement, visual_command,
  slide_count, excerpt, post_status, posted_at, created_at, updated_at
)
SELECT
  id,
  author_id,
  topic,
  CASE platform
    WHEN 'instagram' THEN 'instagram-feed-square'
    WHEN 'facebook'  THEN 'facebook-feed-portrait'
    WHEN 'linkedin'  THEN 'linkedin-single-image-landscape'
    ELSE 'instagram-feed-portrait'
  END,
  '/infographic',
  slide_count,
  excerpt,
  post_status,
  posted_at,
  created_at,
  updated_at
FROM posts;

DROP TABLE posts;

ALTER TABLE posts_n RENAME TO posts;

CREATE INDEX posts_author_idx ON posts(author_id);
CREATE INDEX posts_status_idx ON posts(post_status);
CREATE INDEX posts_created_idx ON posts(created_at);

COMMIT;

PRAGMA foreign_keys=ON;
