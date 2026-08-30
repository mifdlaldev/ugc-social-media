-- Migration 0006: add posts.style_lock
--
-- One aesthetic-only style specification per post, reused verbatim by every slide
-- so a carousel stays visually consistent from hook to CTA.
--
-- The column is nullable and carries no CHECK constraint, so SQLite supports
-- ALTER TABLE ADD COLUMN and no table rebuild is required. NULL means the owner
-- has not produced a style lock yet; no default text is invented.
--
-- Contract (enforced in application code, not by the database): the text holds
-- visual medium, colour palette, typography treatment, shape/line language, and
-- background treatment only. It must never carry engineering facts, numbers,
-- materials, dimensions, named methods, standards, or citations.

ALTER TABLE posts ADD COLUMN style_lock text;
