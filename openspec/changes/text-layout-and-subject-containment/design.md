# Design: Consistent Text Layout and Subject Containment

## Problem Evidence

Owner-approved hook (square 1080x1080) exhibits three defects:

1. Headline occupies four lines with unequal line lengths; final line is short, leaving a large empty region on the right of the text block.
2. Label badges (`BATA MERAH`, `BATA RINGAN (HEBEL)`, `DINDING RUMAH`) use different anchor sides, widths, and offsets; one label sits close to the right edge.
3. Bottom `DINDING RUMAH` wall subject is cut by the canvas edge.

Current prompt causes this because:

- `visual_notes` describes objects, fields, and shadows but not a text block geometry;
- style lock's `FOCAL POINT` line explicitly permits `cropped at edge`, with no exception for labelled teaching subjects;
- style lock's `BACKGROUND` line requires a breathing margin but does not require labelled subjects to stay inside it.

## Decision

Three prompt seams change. No schema change, no coordinate system, no post-processing.

### 1. Style lock (`src/lib/server/styleLockService.ts`)

- `TYPOGRAPHY`: add requirement for one text-block system with shared alignment, controlled measure, balanced line lengths, and consistent line-height/gap relationships.
- `FOCAL POINT`: keep free position, but restrict `cropped at edge` to unlabelled atmosphere or decorative elements.
- `BACKGROUND`: state that labelled subjects, labels, and text stay inside the breathing margin.
- Art direction rules: add a text-and-label layout rule and a containment rule.

### 2. Visual notes (`src/lib/server/promptGenerator.ts`)

Add rules requiring `visual_notes` to:

- allocate a text zone, subject zone, and label anchors;
- describe the primary text as one block with shared alignment and balanced line breaks, no large unused side space;
- describe labels with shared badge treatment, padding, and alignment rhythm, near their subjects, inside safe margins;
- keep labelled subjects fully inside the canvas with a buffer;
- permit cropping only for unlabelled atmosphere or purely decorative elements.

`visual_notes` is bounded at 220 chars. Adding four more mandates risks crowding out composition description. Mitigation: keep new wording compact and move canvas-level containment/text-block guarantees into the provider template, which has no length bound. The visual-note prompt states the intent; the provider prompt states the enforceable instruction.

### 3. Provider templates (`src/lib/server/promptGenerator.ts`)

Add one shared rule constant, e.g. `LAYOUT_RULE`, emitted in all three templates alongside `EXACT_TEXT_RULE` and `EXCLUSIONS_RULE`:

- primary text as one aligned block, controlled measure, balanced line lengths, consistent line-height, no large unused space beside it;
- labels share one badge treatment, padding, and alignment rhythm;
- all text, labels, and labelled subjects fully inside the canvas with a clear margin;
- only unlabelled atmosphere or purely decorative elements may be cropped.

Wording must not alter characters of `on_image_text`; line-break planning is layout direction, not text rewriting.

## Non-Decisions

- No numeric pixel margins in the prompt. Providers do not honour pixel instructions reliably, and the app has no measurement feedback loop. The rule is relational (`clear margin`, `balanced`, `shared`), matching how the rest of the prompt is written.
- No bounding-box schema, no coordinates, no font-size fields.
- No change to `1080x1080` or the placement catalog. The clipped wall is a composition-planning failure, not a canvas-size failure. If the owner later wants the wall uncropped by format, that is a placement choice (`4:5`), not a prompt fix.
- No image validation, OCR, or retry-on-clip logic.
- No new facts, labels, or subjects.

## Testing

- `STYLE_LOCK_SYSTEM_PROMPT` contains the text-block, containment, and crop-exception wording; still contains the eight labelled lines and aesthetic-only rules.
- `VISUAL_NOTES_SYSTEM_PROMPT` requires text zone/subject zone/label anchors, one aligned text block, balanced line breaks, shared label system, containment.
- Every provider prompt contains the layout rule, keeps `EXACT TEXT:`, `EXCLUSIONS:`, both section headings, verbatim style lock, canvas, and ratio.
- No provider guarantee language, no pixel-margin invention, no new facts.

Automated tests verify prompt text only. Visual outcome requires owner review with an external generator.
