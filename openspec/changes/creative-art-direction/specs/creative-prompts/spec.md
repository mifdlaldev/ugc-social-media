# Creative Art Direction Delta

## MODIFIED Requirements

### Requirement: Per-Slide Visual Direction

The system SHALL generate concrete visual direction that includes both subject treatment and an intentional editorial composition suited to the selected visual form and slide meaning. Visual direction MUST NOT default to object inventory alone.

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

### Requirement: Creative Composition Devices

The system SHALL permit visual direction to use composition devices appropriate to the selected visual form, including colour fields, diagonal divisions, bold dividers, diagrammatic arrows, callout lines, frames, badges, shadows, texture fields, geometric accents, overlap, varied scale, depth, and spatial rhythm.

#### Scenario: Composition device supports meaning
- GIVEN a slide whose visual form supports a diagram, comparison, process, cutaway, layered, or editorial treatment
- WHEN visual notes are generated
- THEN notes MAY include relevant composition devices
- AND each device serves hierarchy, relationship, or visual emphasis rather than interface imitation

#### Scenario: Creative device does not add facts
- GIVEN visual notes with arrows, badges, labels, shadows, or texture
- WHEN notes are inspected
- THEN those devices do not introduce unsupported factual content

### Requirement: Catalogue-Grid Avoidance

The system SHOULD avoid literal catalogue compositions such as a centred inventory grid, fixed `3x2` or `2x3` arrangement, uniform tiles, or headline-at-top placement when those choices are not required by the selected visual form or slide meaning.

#### Scenario: Default layout is not an inventory grid
- GIVEN a slide supplies multiple subjects for an infographic
- WHEN visual notes are generated
- THEN the notes SHOULD prefer an intentional relationship, contrast, hierarchy, or visual metaphor over a uniform centred inventory grid
- AND the notes MUST NOT require a fixed `3x2` or `2x3` arrangement by default

#### Scenario: Grid is semantically required
- GIVEN the selected visual form or slide meaning requires a grid, matrix, or catalogue
- WHEN visual notes are generated
- THEN a grid MAY be used
- AND the notes still specify hierarchy, rhythm, contrast, or another deliberate art-direction choice

### Requirement: Focal Hierarchy and Variation

The system SHALL preserve one dominant focal entry point while allowing supporting elements to vary in scale, overlap, depth, direction, and position per slide.

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

### Requirement: Arrow and UI Boundary

The system SHALL permit arrows as diagrammatic or compositional elements while prohibiting arrows that imitate carousel navigation or application UI. Carousel dot indicators, page indicators, swipe arrows, app/browser interface, and device frames SHALL remain prohibited.

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

## ADDED Requirements

### Requirement: Positive Art Direction in Style Lock

The style-lock generation instruction SHALL request positive art direction beyond palette and object treatment, including a controlled editorial composition language, texture/depth treatment, and ways supporting elements can create visual rhythm while preserving legibility.

#### Scenario: Style lock contains positive direction
- GIVEN a style-lock generation request
- WHEN the instruction is inspected
- THEN it asks for composition language, texture or depth treatment, and visual rhythm
- AND it does not prescribe one permanent layout or one mandatory reference-image style

#### Scenario: Creative direction remains aesthetic-only
- GIVEN a generated style lock with positive art direction
- WHEN it is validated
- THEN it contains no engineering facts, numbers, material properties, dimensions, standards, citations, dates, or durations

### Requirement: Positive Art Direction in Visual Notes

The visual-note generation instruction SHALL require notes to choose a composition concept and at least one appropriate composition device when useful, rather than merely listing objects and labels.

#### Scenario: Notes select concept before inventory
- GIVEN a visual-note generation request
- WHEN the instruction is followed
- THEN notes first establish composition concept, focal hierarchy, and spatial relationship
- AND object inventory and labels support that composition

#### Scenario: Notes preserve text boundary
- GIVEN generated visual notes and `on_image_text`
- WHEN provider prompt is built
- THEN creative composition does not authorize rendering explanation, research context, or unapproved text

## Constraint

All requirements from `per-post-style-lock`, `human-voice-and-visual-impact`, and `visual-style-calibration` that are not explicitly modified by this change remain in effect. Fact fidelity outranks creative direction. External image generation remains stochastic; no requirement guarantees professional quality, innovation, or provider compliance.