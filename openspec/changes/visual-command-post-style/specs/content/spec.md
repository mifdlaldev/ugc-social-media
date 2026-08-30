# Content Delta

## MODIFIED Requirements

### Requirement: Owner Post Authoring
The system SHALL allow the authenticated owner to create, edit, and delete social media posts with a topic, platform target, visual command, and slide count.

#### Scenario: Create a social media post
- GIVEN an authenticated owner
- WHEN the owner submits a valid topic, platform, visual_command, and slide_count (3-7)
- THEN the system persists the post as a draft
- AND the post appears in the owner workspace

#### Scenario: Edit a post
- GIVEN an existing post owned by the owner
- WHEN the owner updates the topic, platform, visual_command, or slide_count with valid values
- THEN the system saves the changes

#### Scenario: Delete a post
- GIVEN an existing post owned by the owner
- WHEN the owner deletes the post
- THEN the system removes it from the feed and owner workspace
- AND all related research sources, prompt slides, and provider variants are cascade deleted

#### Scenario: Reject invalid post input
- GIVEN a post submission with an empty topic, an unsupported platform or visual_command value, or slide_count outside 3-7
- WHEN the submission is received
- THEN the system rejects it with a validation error
- AND the post is not persisted

### Requirement: Platform and Visual Command Configuration
The system SHALL support three platforms (instagram, facebook, linkedin) and exactly eighteen visual commands as fixed enums on each post. The eighteen visual commands SHALL be `/infographic`, `/scientificdiagram`, `/diagram`, `/schematic`, `/flowchart`, `/process`, `/comparison`, `/timeline`, `/conceptmap`, `/anatomy`, `/blueprint`, `/isometric`, `/explodedview`, `/cutaway`, `/crosssection`, `/layers`, `/scale`, and `/handwrittennotes`.

#### Scenario: Platform determines aspect ratio
- GIVEN a post with platform=instagram
- WHEN the system generates prompt slides
- THEN the default aspect ratio is 1:1 or 4:5

#### Scenario: Visual command determines visual form
- GIVEN a post with visual_command=/cutaway
- WHEN the system generates prompt slides
- THEN each generated prompt instructs the external image generator to render a cutaway view

#### Scenario: Reject a command outside the curated set
- GIVEN a post submission with visual_command=/cyberpunk
- WHEN the submission is received
- THEN the system rejects it with a validation error
- AND the post is not persisted

#### Scenario: Visual command is chosen at post creation
- GIVEN the owner is creating or editing a post
- WHEN the owner opens the visual command control
- THEN all eighteen commands are selectable with their catalog descriptions
- AND the selection is stored on the post rather than being chosen during generation

### Requirement: Visual Command Catalog Fidelity
The system SHALL present each visual command using only the command name and description recorded in the owner-supplied catalog, and SHALL NOT introduce engineering facts through the command metadata.

#### Scenario: Description matches the catalog
- GIVEN the visual command `/blueprint`
- WHEN the owner views the selection control
- THEN the displayed description is the catalog description for that command
- AND no additional technical claim, dimension, material, or standard is shown

#### Scenario: Command does not license new facts
- GIVEN a post with any visual_command
- WHEN prompt slides are generated
- THEN every factual claim still originates only from the approved research sources and the owner topic

## REMOVED Requirements

### Requirement: Tone Configuration (REMOVED)
The five-value `tone` enum (`detail`, `observatif`, `informatif`, `menjual`, `creative`) is REMOVED from posts. Tone described a manner of speaking and did not determine the visual form of the generated infographic.

#### Scenario: Tone is not accepted
- GIVEN a post submission containing a `tone` field
- WHEN the submission is received
- THEN `tone` is not persisted on the post
- AND the visual style is determined by `visual_command`
