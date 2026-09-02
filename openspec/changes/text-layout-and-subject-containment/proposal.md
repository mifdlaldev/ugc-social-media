# Proposal: Consistent Text Layout and Subject Containment

## Context

Owner approves creative direction from `creative-art-direction`: editorial split, colour fields, texture, shadow, and strong hierarchy. Latest generated square hook demonstrates remaining production issues:

- headline line lengths create an accidental rag and excessive unused space on the right;
- label badges do not share consistent anchors, widths, or internal spacing;
- the lower house-wall subject and its label are cut by the square frame;
- current style lock explicitly allows a focal element to be cropped at an edge, but does not distinguish intentional crop from accidental loss of a labelled teaching subject.

## Problem

Creative composition improved, but prompt lacks a repeatable text-layout contract and containment rule. External image generators may invent line breaks, align each label independently, and push supporting subjects beyond the canvas.

## Solution

Add explicit prompt instructions for:

- stable text block geometry: one text column/zone, shared left edge, controlled maximum width, intentional line breaks, consistent line-height and gaps, no arbitrary right-side void;
- headline hierarchy: reserve enough width for the primary text, balance line lengths, keep question/hook readable, and avoid oversized type consuming the entire composition unless required;
- label system: consistent badge treatment, shared padding, baseline/alignment rhythm, labels placed near their referred subjects with visible separation from the canvas edge;
- subject containment: keep all labelled teaching subjects fully visible inside canvas with a clear buffer; crop only unlabelled atmosphere or approved purely decorative elements;
- composition planning: allocate text, subject, and label zones before rendering, while retaining creative split/diagonal/layered compositions.

The prompt must continue to use exact `on_image_text`, allow only supplied visual labels, preserve 1:1 canvas, and prohibit added text or UI. The change does not alter image dimensions or guarantee external provider compliance.

## Scope

### In Scope

- Style-lock typography and focal-point wording.
- Per-slide visual-note instructions for text zone, line-break planning, label alignment, whitespace, and subject containment.
- Provider prompt wording that makes text/subject containment explicit.
- Tests for new prompt contract.

### Out of Scope

- New schema fields for bounding boxes, coordinates, font sizes, or line breaks.
- Image generation, image validation, OCR, post-processing, or provider-specific seed/control parameters.
- Changing platform dimensions or aspect-ratio catalog.
- Adding facts, labels, copy, or visual subjects not supplied by existing inputs.
- Removing creative composition devices approved by `creative-art-direction`.

## Success Criteria

- Generated prompts tell provider to plan text, subject, and label zones before rendering.
- Primary text uses one consistent text block with controlled width, balanced line breaks, stable alignment, and no accidental unused side space.
- Labels use a coherent shared badge/anchor system and remain within safe margins.
- Labelled subjects remain fully visible within target canvas; only unlabelled atmosphere/decorative elements may be cropped.
- Creative split, diagonal, texture, shadow, overlap, and visual rhythm remain allowed.
- Existing render boundary, exact text, exclusion, style-lock, ratio, and fact-fidelity rules remain intact.
- Unit tests, typecheck, lint, and OpenSpec validation pass.

## Research Basis

Research reviewed on 2026-09-01 recommends consistent outer margins and shared text start lines, fixed text-box width/height and spacing relationships, clear type hierarchy, and treating whitespace as structural. Sources included:

- https://venngage.com/blog/infographic-design/
- https://www.smashingmagazine.com/2022/10/typographic-hierarchies/
- https://venngage.com/blog/infographic-size-guide-web-social-print/
- https://www.linearity.io/blog/instagram-size-guide/

These sources guide layout principles only. They do not add engineering facts or override application specs.

## Risks

- Excessive containment rules may make compositions too rigid. Mitigation: constrain accidental clipping only; keep crop permission for unlabelled decorative atmosphere.
- Balanced line breaks may be interpreted as rewriting. Mitigation: preserve exact text and describe line-break planning without changing characters or words.
- Fixed zones may reduce visual variety. Mitigation: require consistent relationships and safe buffers, not fixed coordinates or one universal layout.
