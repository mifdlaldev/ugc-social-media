# Design: Rebalance Layout Contract for Creative Infographic Prompts

## Problem Evidence

Recent square hook (`04_56_31 PM`) regressed relative to the preferred hook (`04_38_00 PM`):

- headline rendered as a narrow left-half column with a large unused right field;
- comparison subjects rendered as mirrored equals with identical scale and placement;
- dominant subjects reduced in scale to satisfy containment wording;
- vertical divider and text-zone wording conflicted, producing a stranded text block.

Root causes:

- `controlled maximum measure` plus `max measure short` plus `one shared left-aligned text block` can be read as a narrow column;
- `text zone upper third` plus `vertical bold divider splits canvas` can be read as a full-height split through the text zone;
- containment wording without a dominant-scale floor can be read as shrink-to-fit;
- comparison direction lacks an anti-mirroring rule;
- style lock lost the `never two equal rivals` focal wording;
- `thin frame` in style lock conflicts with `No decorative borders or frames` in exclusions.

## Decision

Three prompt seams change. No schema, coordinate, or image-processing change.

### 1. Style lock (`src/lib/server/styleLockService.ts`)

- `TYPOGRAPHY`: replace `controlled maximum measure` / `max measure short` with a proportional text-block system: shared alignment, balanced line lengths, consistent line-height and gap steps, and a usable proportional width within the text band. Remove narrow-column implication.
- `FOCAL POINT`: restore dominant-entry wording and add comparison anti-rival wording: where slide meaning compares subjects, one subject dominates through scale, depth, overlap, angle, elevation, or placement; do not default to mirrored equal rivals.
- `SHAPE LANGUAGE` / art-direction rules: keep structural framing and composition devices, but clarify that framing is a composition device, not a decorative border or device frame.
- `BACKGROUND`: keep breathing margin and containment, but add that dominant labelled subjects SHOULD fill their subject zone while remaining inside the margin.
- Art-direction rules: add split-safety wording that dividers, colour fields, and other split devices MUST NOT cut through or strand the primary text block.

### 2. Visual notes (`src/lib/server/promptGenerator.ts`)

Update `VISUAL_NOTES_SYSTEM_PROMPT` to:

- describe primary text as one proportional block that MAY span the usable width of its text band, with balanced line lengths and no large unused side space caused by a decorative split;
- require text zone and split/divider placement to be non-conflicting;
- require labelled subjects to remain fully visible while dominant subjects retain meaningful scale within their subject zone;
- require comparison or paired-subject slides to use visible hierarchy or contrast and avoid mirrored equal rivals unless semantics require symmetry;
- keep shared badge treatment, padding, alignment rhythm, and safe margins.

`visual_notes` remains bounded at 220 chars. Mitigation: shorten redundant phrases and keep one authoritative layout rule per seam; move enforceable guarantees into the provider template.

### 3. Provider templates (`src/lib/server/promptGenerator.ts`)

Update shared `LAYOUT_RULE` and `EXCLUSIONS_RULE`:

- `LAYOUT_RULE`: primary text as one proportional aligned block with balanced line lengths and consistent line-height; no large unused space beside it caused by a decorative split; text zone and split/divider MUST NOT conflict; labels share one badge treatment, padding, and alignment rhythm; all text, labels, and labelled subjects fully inside the canvas with a clear margin; dominant labelled subjects SHOULD fill their subject zone while remaining inside the margin; only unlabelled atmosphere or purely decorative elements may run off the edge; comparison subjects SHOULD differ in scale, angle, depth, overlap, elevation, or placement and MUST NOT default to mirrored equal rivals.
- `EXCLUSIONS_RULE`: keep prohibition on decorative borders, device frames, watermarks, logos, signatures, QR codes, carousel dots, page indicators, swipe arrows, app/browser interface, and device frames, but allow structural composition framing as a deliberate device distinct from decorative borders.

Wording must not alter characters of `on_image_text`; line-break planning remains layout direction, not text rewriting.

## Non-Decisions

- No numeric pixel margins, bounding boxes, coordinates, or font-size fields.
- No change to `1080x1080` or the placement catalog.
- No image validation, OCR, or retry-on-clip logic.
- No new facts, labels, or subjects.
- No provider guarantee language.

## Testing

- `STYLE_LOCK_SYSTEM_PROMPT` contains proportional text-block wording, split-safety wording, dominant-scale wording, and anti-rival wording; still contains the eight labelled lines and aesthetic-only rules.
- `VISUAL_NOTES_SYSTEM_PROMPT` requires proportional text width, split safety, dominant scale, and anti-symmetry for comparison slides.
- Every provider prompt contains the updated layout rule, keeps `EXACT TEXT:`, `EXCLUSIONS:`, both section headings, verbatim style lock, canvas, and ratio.
- Exclusions still prohibit decorative borders and device frames while allowing structural composition framing.
- No pixel-margin invention, provider guarantee, or new factual content.
