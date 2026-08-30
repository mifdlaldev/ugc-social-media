# Prompt Engine Delta

## MODIFIED Requirements

### Requirement: Prompt Generation Pipeline
The system SHALL use the selected image placement's exact target width, height, and ratio when generating every slide and provider variant.

#### Scenario: Exact canvas reaches every provider variant
- GIVEN an approved post with platform_placement=`instagram-feed-portrait`
- WHEN the owner triggers generation
- THEN every generated provider variant states the target canvas 1080 × 1350 and ratio 4:5
- AND the selected visual command remains present as the visual direction

#### Scenario: Placement is not inferred during generation
- GIVEN a post with a stored platform_placement
- WHEN the owner opens the generate page
- THEN the system uses the stored placement metadata
- AND it does not ask the owner to select a different platform or placement

### Requirement: Placement-Aware Provider Variants
The system SHALL preserve distinct provider variants while applying the same target canvas metadata to each provider variant.

#### Scenario: Provider variants share placement metadata
- GIVEN a post with platform_placement=`pinterest-standard-pin`
- WHEN variants are built for GPT Image, Nano Banana, and Recraft
- THEN all three state 1000 × 1500 and 2:3
- AND their existing provider-specific directions remain distinct

#### Scenario: Exact dimensions are target instructions
- GIVEN any included placement
- WHEN its prompt is generated
- THEN the dimensions and ratio are expressed as target output requirements
- AND the system does not claim that an external provider guarantees compliance

### Requirement: Placement Fact Boundary
The system SHALL use placement metadata only for output-format direction and SHALL NOT use it to add engineering facts or visual subject matter.

#### Scenario: Placement does not add content facts
- GIVEN a post about an engineering topic and placement=`facebook-stories`
- WHEN the prompt is generated
- THEN 1080 × 1920 and 9:16 are included as format instructions
- AND no engineering claim is introduced by the placement metadata

## Unchanged Requirements

The existing research approval gate, You.com research source, synthesis, per-slide ordering, provider separation, defensive parsing, generation-attempt persistence, fact-fidelity guard, and Prompt Block Schema remain unchanged. This change only replaces platform selection and aspect-ratio resolution with a sourced placement catalog.
