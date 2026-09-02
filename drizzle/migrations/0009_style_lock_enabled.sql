-- Migration 0009: add style_lock_enabled to posts
--
-- Owner switch for the style lock. When false, generation skips the style
-- lock entirely and composes each slide from the visual command, placement,
-- and per-slide visual notes alone. When true (default), the saved style lock
-- is injected verbatim into every slide prompt for carousel consistency.
--
-- Existing rows keep their saved style_lock text (NULL or not); the switch
-- defaults to 1 (enabled) so current behaviour is preserved. The saved text
-- is retained when the switch is off so the owner can flip back without
-- regenerating it.

ALTER TABLE posts ADD COLUMN style_lock_enabled integer NOT NULL DEFAULT 1;
