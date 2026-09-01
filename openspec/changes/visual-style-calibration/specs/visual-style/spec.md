# Visual Style Calibration Delta

## MODIFIED Requirements

### Requirement: Style-Lock Background Treatment

The style-lock generation instruction SHALL permit a subtle grid, ruled texture, or other constructive background treatment when it supports the selected visual form and does not reduce text legibility.

#### Scenario: Supporting texture is allowed
- GIVEN a style-lock generation request for a technical or isometric visual form
- WHEN the instruction is followed
- THEN the output MAY specify a subtle grid, ruled texture, or other constructive background treatment
- AND it MUST NOT specify a grid or texture that degrades text legibility

#### Scenario: Strong negative background prohibition is not required
- GIVEN the style-lock generation instruction
- WHEN it is inspected
- THEN it MUST NOT contain a blanket prohibition on background patterns or textures
- AND it MAY still prohibit decorative clutter and ornamental elements that do not support the visual form

### Requirement: Style-Lock Safe Space

The style-lock generation instruction SHALL require readable safe space without prescribing a fixed empty-space proportion or a fixed empty-space position across all slides.

#### Scenario: Flexible safe space
- GIVEN a generated style lock
- WHEN it is inspected
- THEN it must require readable safe space for text
- AND it must not require a fixed percentage, a fixed proportion, or a fixed region of empty area on every slide

### Requirement: Style-Lock Focal Point

The style-lock generation instruction SHALL require one dominant focal element per slide, without prescribing a fixed position or a fixed composition for that focal element across all slides.

#### Scenario: Focal element is required
- GIVEN a generated style lock
- WHEN it is inspected
- THEN it names one dominant focal element per slide
- AND it does not fix the focal element's position across all slides

#### Scenario: Focal element position varies per slide
- GIVEN a generated style lock
- WHEN it is followed by the per-slide visual direction
- THEN the per-slide visual direction determines the focal element's position for that slide
- AND the style lock does not override the per-slide composition

### Requirement: Style-Lock Contrast and Typography

The style-lock generation instruction SHALL require one high-contrast accent against the base palette and a bold display typography hierarchy, as specified in `human-voice-and-visual-impact` §Visual Impact in the Style Lock. These requirements are unchanged.

#### Scenario: Contrast accent is required
- GIVEN a generated style lock
- WHEN it is inspected
- THEN it specifies one high-contrast accent colour against its base palette
- AND it does not expand the palette with additional decorative colours

#### Scenario: Display typography is required
- GIVEN a generated style lock
- WHEN it is inspected
- THEN it specifies a bold display treatment for headings with a readable scale hierarchy

### Requirement: Shared Exclusions

The shared provider-prompt exclusions instruction SHALL prohibit unrequested UI elements, app or browser interface, device frames, decorative borders or frames, watermarks, logos, signatures, QR codes, placeholder text, and extra text beyond the specified artwork text. The instruction SHOULD be structured in shorter, grouped sentences rather than one long sentence, and MUST NOT drop any documented exclusion category.

#### Scenario: Exclusions are grouped
- GIVEN a generated provider prompt with an exclusions instruction
- WHEN it is inspected
- THEN the instruction covers all documented exclusion categories
- AND it is structured as two or more grouped sentences

#### Scenario: Exclusion categories are preserved
- GIVEN the exclusions instruction
- WHEN it is inspected
- THEN it still prohibits each of: carousel dot indicators, page indicators, swipe arrows, app or browser interface, device frames, decorative borders, decorative frames, watermarks, logos, signatures, QR codes, placeholder text, additional text beyond the specified artwork text, paragraphs of body copy, and rendering of the composition-context section

### Requirement: Artwork Text Boundary

The system SHALL distinguish artwork text from teaching context in every generated provider prompt, as specified in `human-voice-and-visual-impact` §Artwork Text Boundary. The instruction "Render no other text" SHALL be preserved for text beyond the quoted primary artwork text and explicitly listed visual labels.

#### Scenario: Primary artwork text stays explicit
- GIVEN a generated slide
- WHEN a provider prompt is built
- THEN the only primary rendered text is the exact `on_image_text`
- AND any additional rendered text is limited to explicitly approved labels

#### Scenario: No other text is rendered
- GIVEN a generated provider prompt
- WHEN it is inspected
- THEN it includes an instruction that no text beyond the quoted primary text and listed labels is rendered
- AND it retains the separation between artwork text and composition-context sections

## ADDED Requirements

### Requirement: Visual-Stable Constraint Enumeration

The system SHALL enumerate the current stable visual constraints in the style-lock and provider-prompt instructions so that future changes to those constraints are explicit rather than implicit.

#### Scenario: Constraints are stated
- GIVEN the style-lock generation instruction
- WHEN it is inspected
- THEN it states each required visual property on a separate short line: medium, palette, typography, focal point, shape language, background, contrast, consistency
- AND no additional constraint is buried in a prose paragraph outside these labelled lines

#### Scenario: Constraints are grouped
- GIVEN the provider-prompt exclusions instruction
- WHEN it is inspected
- THEN it groups related exclusions (UI elements, branding, text, copy) into separate sentences
- AND each group is labelled or clearly separated

## REMOVED Requirements

The following requirement from `human-voice-and-visual-impact` §Visual Impact in the Style Lock is removed:

- The style-lock generation instruction MUST prohibit background patterns that fight the text.

This is replaced by the new requirement: constructive background treatment is permitted, and only decorative clutter and ornamental elements that do not support the visual form remain prohibited.

The following requirement from `human-voice-and-visual-impact` §Visual Impact in the Style Lock is modified:

- The style-lock generation instruction MUST require generous safe space so text is never crowded, without prescribing a fixed empty-space proportion or fixed empty-space position.

This is replaced by the safe-space requirement above.

## Constraint

All requirements from `per-post-style-lock` and `human-voice-and-visual-impact` that are not explicitly modified or removed by this change remain in effect. These include: verbatim style-lock reuse across slides, exact-text marking, visual command prefix, canvas and aspect ratio, no-fact rules, aesthetic-only validation, render-boundary separation, and fact-fidelity priority.