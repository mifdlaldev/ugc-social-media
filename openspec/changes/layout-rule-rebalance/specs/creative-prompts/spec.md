# Layout Rule Rebalance Delta

## MODIFIED Requirements

### Requirement: Text Layout Consistency

The system SHALL require consistent text layout in visual direction and provider prompts: one primary text block with a shared alignment, balanced line lengths, consistent line-height and gaps, and a proportional usable width within its text band. The primary text block SHALL NOT be reduced to a narrow column created by a decorative split, and no large unused side space SHALL remain beside it.

#### Scenario: Primary text uses one proportional block
- GIVEN a slide with primary text
- WHEN visual notes are generated
- THEN the notes describe one primary text block with a shared alignment, balanced line lengths, and a proportional usable width within its text band
- AND the notes do not describe each line as an independent floating element

#### Scenario: Text block is not stranded by a split device
- GIVEN a slide whose visual direction uses a divider, colour field, or other split device
- WHEN visual notes and provider prompt are inspected
- THEN the split device does not cut through or strand the primary text block
- AND no large unused field remains beside the primary text as a result of the split

#### Scenario: Text hierarchy remains readable
- GIVEN a slide with primary text
- WHEN visual notes are generated
- THEN the notes keep primary text legible at small size and do not describe oversized type that consumes the entire composition unless the slide meaning requires it

### Requirement: Focal Hierarchy and Variation

The system SHALL preserve one dominant focal entry point while allowing supporting elements to vary in scale, overlap, depth, direction, and position per slide. Where slide meaning compares or pairs subjects, one subject SHALL dominate through scale, depth, overlap, angle, elevation, or placement, and compared subjects SHALL NOT default to mirrored equal rivals. Labelled teaching subjects SHALL remain fully visible within the canvas; only unlabelled atmosphere or purely decorative elements MAY be cropped.

#### Scenario: Focal hierarchy is clear
- GIVEN generated visual notes
- WHEN notes are inspected
- THEN one dominant focal entry point is identifiable
- AND supporting subjects do not receive equal catalogue-style emphasis by default

#### Scenario: Comparison avoids mirrored equals
- GIVEN a slide whose meaning compares or pairs subjects
- WHEN visual notes and provider prompt are inspected
- THEN compared subjects differ in at least one of scale, angle, depth, overlap, elevation, or placement
- AND mirrored equal placement with identical subject size and identical label position is not required by default
- AND symmetry MAY still be used when the slide meaning requires a symmetric diagram

#### Scenario: Labelled subject is not clipped
- GIVEN a slide with a labelled subject
- WHEN visual notes and provider prompt are inspected
- THEN the labelled subject is described as fully visible inside the canvas with a buffer from the edge
- AND only unlabelled atmosphere or decorative elements may be described as cropped

### Requirement: Subject Containment in Provider Prompt

The system SHALL include explicit subject-containment wording in every provider prompt so that labelled teaching subjects and labels remain fully visible within the target canvas. Containment SHALL NOT be expressed in a way that reduces the dominant labelled subject below a meaningful scale; a dominant labelled subject SHOULD fill its assigned subject zone while retaining a clear edge buffer.

#### Scenario: Provider prompt states containment
- GIVEN a generated provider prompt
- WHEN it is inspected
- THEN it states that labelled subjects and labels must remain fully visible inside the canvas with a buffer from the edge
- AND it states that only unlabelled atmosphere or purely decorative elements may be cropped

#### Scenario: Containment preserves dominant scale
- GIVEN a generated provider prompt
- WHEN it is inspected
- THEN it states that a dominant labelled subject should fill its subject zone while remaining inside the canvas margin
- AND it does not instruct that subjects be shrunk or centred uniformly to guarantee containment

#### Scenario: Provider prompt preserves canvas
- GIVEN a generated provider prompt
- WHEN it is inspected
- THEN it still states the exact target canvas and aspect ratio
- AND it does not describe subjects extending beyond the canvas

### Requirement: Arrow and UI Boundary

The system SHALL permit arrows as diagrammatic or compositional elements while prohibiting arrows that imitate carousel navigation or application UI. Carousel dot indicators, page indicators, swipe arrows, app/browser interface, and device frames SHALL remain prohibited. Structural composition framing SHALL remain permitted as a deliberate composition device and SHALL be distinguishable from prohibited decorative borders and device frames.

#### Scenario: Diagrammatic arrow is allowed
- GIVEN a visual direction for a process, relationship, comparison, or explanatory diagram
- WHEN provider prompt is built
- THEN a diagrammatic or compositional arrow MAY appear in visual direction
- AND it is described as part of artwork composition, not navigation UI

#### Scenario: Navigation cues remain prohibited
- GIVEN any provider prompt
- WHEN exclusions are inspected
- THEN carousel dot indicators, page indicators, swipe arrows, app/browser interface, and device frames remain prohibited
- AND the prohibition does not remove legitimate diagrammatic arrows from visual direction

#### Scenario: Structural framing is distinguished from decorative borders
- GIVEN a style lock that permits structural composition framing
- WHEN provider exclusions are inspected
- THEN decorative borders, ornamental frames, and device frames remain prohibited
- AND structural composition framing remains permitted as a composition device

## ADDED Requirements

### Requirement: Layout Rule Conflict Avoidance

The system SHALL emit layout direction that does not contain contradictory placement instructions. Text-zone direction, split or divider direction, subject-zone direction, and containment direction SHALL be expressed as compatible relationships rather than competing absolute constraints.

#### Scenario: Layout direction is internally consistent
- GIVEN a generated provider prompt and its visual notes
- WHEN layout, split, subject, and containment wording are inspected
- THEN the instructions can be satisfied together
- AND no instruction requires both a full-canvas split through the text zone and an intact primary text block in that same zone

#### Scenario: Redundant layout wording is reduced
- GIVEN a generated provider prompt
- WHEN layout wording is inspected
- THEN one authoritative layout rule governs text block, label system, containment, and dominant scale
- AND the same constraint is not repeated with conflicting thresholds across style lock and provider rule

## Constraint

All requirements from `per-post-style-lock`, `human-voice-and-visual-impact`, `visual-style-calibration`, `creative-art-direction`, and `text-layout-and-subject-containment` that are not explicitly modified by this change remain in effect. Fact fidelity outranks creative and layout direction. External image generation remains stochastic; no requirement guarantees provider compliance, exact line breaks, exact scale relationships, or pixel-perfect layout.
