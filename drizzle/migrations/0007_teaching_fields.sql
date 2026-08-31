-- Migration 0007: structured teaching fields on prompt_slides
--
-- The generator previously produced only a short key phrase per slide, so a
-- carousel carried headlines with nothing that explained anything. These columns
-- give the teaching copy a structured place to live.
--
-- All four columns are nullable and carry no CHECK constraint, so SQLite supports
-- ALTER TABLE ADD COLUMN and no table rebuild is required. Existing slide rows stay
-- readable with the new columns NULL; the owner regenerates to obtain explanatory
-- copy rather than having text invented for old rows.
--
-- Contract (enforced in application code, not by the database): every factual
-- statement in these fields must originate from approved research or the owner's
-- topic, a source qualifier must be preserved verbatim, and an unsupported claim
-- must be omitted rather than completed from model memory.

ALTER TABLE prompt_slides ADD COLUMN slide_subtitle text;
ALTER TABLE prompt_slides ADD COLUMN slide_explanation text;
ALTER TABLE prompt_slides ADD COLUMN visual_labels text;
ALTER TABLE prompt_slides ADD COLUMN slide_takeaway text;
