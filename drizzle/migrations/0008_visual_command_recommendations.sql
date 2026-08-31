-- Migration 0008: add visual_command_recommendations
--
-- Advisory command advice per post. The owner's posts.visual_command stays
-- authoritative: a row here never changes it. Storing the recommendation means
-- reopening the page costs no extra model call.
--
-- Every command value must exist in src/lib/catalog/visualCommands.ts. No CHECK
-- constraint repeats that list here, because the catalog is the single source of
-- truth and is enforced in the service. Duplicating an 18-value enum in SQL would
-- create a second place to drift.
--
-- alternatives and per_slide hold JSON text. per_slide is nullable: a
-- recommendation without a per-slide plan is valid.

CREATE TABLE visual_command_recommendations (
	id text PRIMARY KEY NOT NULL,
	post_id text NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
	topic_snapshot text NOT NULL,
	model_id text NOT NULL,
	primary_command text NOT NULL,
	primary_reason text NOT NULL,
	alternatives text,
	per_slide text,
	raw_output text,
	created_at integer NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX command_rec_post_idx ON visual_command_recommendations (post_id);

CREATE INDEX command_rec_created_idx ON visual_command_recommendations (created_at);
