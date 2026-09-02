# Proposal: Rebalance Layout Contract for Creative Infographic Prompts

## Context

The `text-layout-and-subject-containment` change improved explicitness but introduced a visual regression in external image generation. A recent square hook placed the primary headline in a narrow half-canvas column, left a large unused field beside it, rendered comparison subjects as mirrored equals, and reduced subject scale to satisfy containment wording. The preferred earlier render used a wider headline band, uneven scale, overlap, diagonal movement, and clearer focal hierarchy.

## Problem

Current prompt rules over-specify relational layout without enough priority or conflict resolution:

- `controlled maximum measure` and `max measure short` can be interpreted as a narrow text column on a split canvas;
- `text zone upper third` can conflict with a full-height divider or other split device;
- containment wording can make labelled subjects undersized instead of preserving dominant scale;
- comparison direction lacks an explicit anti-mirroring rule;
- the style lock does not clearly state that two compared subjects must not become equal visual rivals;
- the style lock and provider exclusions contain conflicting frame language.

## Solution

Rebalance prompt direction so hierarchy and usable space outrank generic narrow-column constraints:

- define primary text as a readable, proportionate block that MAY span the usable width of its text band; avoid narrow columns created only by decorative splits;
- require text zone and split/divider planning to be non-conflicting: dividers, fields, and subjects MUST NOT cut through or strand the primary text block;
- preserve labelled-subject containment without shrinking the dominant subject below a meaningful scale; dominant subjects SHOULD fill their assigned subject zone while retaining a clear edge buffer;
- add comparison anti-symmetry guidance: compared subjects SHOULD differ in scale, angle, depth, overlap, elevation, or placement, and MUST NOT default to mirrored equal rivals;
- restore explicit focal hierarchy wording that one subject dominates where slide meaning supports comparison;
- reconcile frame language so approved structural framing remains distinct from prohibited decorative borders or device frames.

The change keeps exact text, factual fidelity, render/context boundaries, aspect-ratio catalog, and stochastic-provider limitations unchanged. It does not add coordinates, bounding boxes, OCR, image validation, or image generation.

## Scope

### In Scope

- Style-lock typography, focal-point, shape-language, and composition wording.
- Visual-note rules for proportional text width, split safety, dominant scale, and anti-symmetry.
- Shared provider layout wording and frame exclusion wording.
- Tests for prompt priority and conflict avoidance.

### Out of Scope

- New schema fields, coordinates, bounding boxes, font sizes, or provider control parameters.
- Image generation, OCR, image validation, post-processing, or retry-on-visual-failure logic.
- Changing platform dimensions, aspect-ratio catalog, slide count, or visual-command catalog.
- Adding facts, labels, claims, or subjects not supplied by existing inputs.
- Guaranteeing external provider compliance or deterministic visual quality.

## Success Criteria

- Primary text is directed toward a usable proportional text block, not a narrow column caused by a decorative split.
- Split devices and text zones are described without contradictory placement instructions.
- Labelled subjects remain fully visible while dominant subjects retain meaningful scale.
- Comparison direction discourages mirrored equal rivals and requires visible hierarchy or contrast.
- Structural composition framing remains possible while decorative borders, device frames, and UI remain prohibited.
- Existing exact-text, factual-safety, render-boundary, canvas, ratio, and stochasticity rules remain intact.
- OpenSpec validation and prompt tests pass; owner can render a new square hook for manual review.

## Risks

- Wider text blocks may reduce room for subjects. Mitigation: require proportional zone allocation and preserve slide-specific composition rather than fixed coordinates.
- Anti-symmetry wording may weaken genuinely symmetric diagrams. Mitigation: apply it to comparison or paired-subject meanings, while allowing symmetry when semantics require it.
- Dominant-scale wording may cause clipping. Mitigation: retain containment and edge-buffer rules; only unlabelled atmosphere or decoration may crop.
- Additional wording may increase prompt complexity. Mitigation: remove redundant phrases and keep one authoritative layout rule per seam.
