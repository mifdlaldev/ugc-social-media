# Text Layout and Subject Containment Delta

## MODIFIED Requirements

### Requirement: Per-Slide Visual Direction

The system SHALL generate concrete visual direction that includes both subject treatment and an intentional editorial composition suited to the selected visual form and slide meaning. Visual direction MUST NOT default to object inventory alone. Visual direction SHALL also define a stable text zone, label placement, and subject containment so that primary text, labels, and labelled subjects remain legible and fully visible within the target canvas.

#### Scenario: Visual direction has an editorial concept
- GIVEN a slide with supplied teaching copy and selected visual form
- WHEN visual notes are generated
- THEN the notes describe one deliberate composition or visual concept
- AND the notes describe focal subject, spatial relationship, and visual hierarchy

#### Scenario: Visual direction remains factual-safe
- GIVEN a visual-note generation request
- WHEN notes are generated
- THEN they may stylize or arrange supplied subjects
- AND they MUST NOT add engineering facts, numbers, material properties, dimensions, standards, citations, or claims

#### Scenario: Visual direction plans text and subject zones
- GIVEN a slide with primary text, labels, and labelled subjects
- WHEN visual notes are generated
- THEN the notes allocate a text zone, a subject zone, and label anchors before rendering
- AND the notes keep primary text, labels, and labelled subjects inside the canvas with a clear buffer from the edge

### Requirement: Creative Composition Devices

The system SHALL permit visual direction to use composition devices appropriate to the selected visual form, including colour fields, diagonal divisions, bold dividers, diagrammatic arrows, callout lines, frames, badges, shadows, texture fields, geometric accents, overlap, varied scale, depth, and spatial rhythm. Composition devices SHALL NOT create accidental clipping of labelled subjects or inconsistent text alignment.

#### Scenario: Composition device supports meaning
- GIVEN a slide whose visual form supports a diagram, comparison, process, cutaway, layered, or editorial treatment
- WHEN visual notes are generated
- THEN notes MAY include relevant composition devices
- AND each device serves hierarchy, relationship, or visual emphasis rather than interface imitation

#### Scenario: Creative device does not add facts
- GIVEN visual notes with arrows, badges, labels, shadows, or texture
- WHEN notes are inspected
- THEN those devices do not introduce unsupported factual content

#### Scenario: Composition device preserves containment
- GIVEN visual notes with a composition device
- WHEN notes are inspected
- THEN the device does not push a labelled subject or label outside the canvas or against the canvas edge

### Requirement: Focal Hierarchy and Variation

The system SHALL preserve one dominant focal entry point while allowing supporting elements to vary in scale, overlap, depth, direction, and position per slide. Labelled teaching subjects SHALL remain fully visible within the canvas; only unlabelled atmosphere or purely decorative elements MAY be cropped.

#### Scenario: Focal hierarchy is clear
- GIVEN generated visual notes
- WHEN notes are inspected
- THEN one dominant focal entry point is identifiable
- AND supporting subjects do not receive equal catalogue-style emphasis by default

#### Scenario: Slide composition varies
- GIVEN multiple slides sharing one style lock
- WHEN visual notes are generated
- THEN composition, focal position, visual metaphor, and spatial rhythm MAY vary by slide
- AND shared aesthetic properties remain governed by style lock

#### Scenario: Labelled subject is not clipped
- GIVEN a slide with a labelled subject
- WHEN visual notes and provider prompt are inspected
- THEN the labelled subject is described as fully visible inside the canvas with a buffer from the edge
- AND only unlabelled atmosphere or decorative elements may be described as cropped

## ADDED Requirements

### Requirement: Text Layout Consistency

The system SHALL require consistent text layout in visual direction and provider prompts: one primary text block with a shared alignment, controlled maximum width, intentional line breaks, consistent line-height and gaps, and no arbitrary unused side space.

#### Scenario: Primary text uses one stable block
- GIVEN a slide with primary text
- WHEN visual notes are generated
- THEN the notes describe one primary text block with a shared left edge or shared alignment, a controlled maximum width, and intentional line breaks that balance line lengths
- AND the notes do not describe each line as an independent floating element

#### Scenario: Text block avoids accidental void
- GIVEN a slide with primary text
- WHEN visual notes are generated
- THEN the notes allocate enough width for the primary text and balance line lengths so that no large unused side space remains beside the text block

#### Scenario: Text hierarchy remains readable
- GIVEN a slide with primary text
- WHEN visual notes are generated
- THEN the notes keep primary text legible at small size and do not describe oversized type that consumes the entire composition unless the slide meaning requires it

### Requirement: Label System Consistency

The system SHALL require a consistent label system: shared badge treatment, shared padding, shared baseline or alignment rhythm, and labels placed near their referred subjects with visible separation from the canvas edge.

#### Scenario: Labels share one system
- GIVEN a slide with labels
- WHEN visual notes are generated
- THEN the notes describe labels with a shared badge or tag treatment, shared padding, and a shared alignment rhythm
- AND labels are placed near the subjects they identify

#### Scenario: Labels remain inside safe margins
- GIVEN a slide with labels
- WHEN visual notes are generated
- THEN labels are described as inside the canvas with a clear buffer from the edge
- AND labels are not described as touching or crossing the canvas edge

### Requirement: Subject Containment in Provider Prompt

The system SHALL include explicit subject-containment wording in every provider prompt so that labelled teaching subjects and labels remain fully visible within the target canvas.

#### Scenario: Provider prompt states containment
- GIVEN a generated provider prompt
- WHEN it is inspected
- THEN it states that labelled subjects and labels must remain fully visible inside the canvas with a buffer from the edge
- AND it states that only unlabelled atmosphere or purely decorative elements may be cropped

#### Scenario: Provider prompt preserves canvas
- GIVEN a generated provider prompt
- WHEN it is inspected
- THEN it still states the exact target canvas and aspect ratio
- AND it does not describe subjects extending beyond the canvas

## Constraint

All requirements from `per-post-style-lock`, `human-voice-and-visual-impact`, `visual-style-calibration`, and `creative-art-direction` that are not explicitly modified by this change remain in effect. Fact fidelity outranks creative direction. External image generation remains stochastic; no requirement guarantees provider compliance, exact line breaks, or pixel-perfect layout.
