# Content Delta

## ADDED Requirements

### Requirement: Per-Post Style Lock
The system SHALL store one style lock per post, describing only aesthetic properties, and SHALL use it for every slide of that post.

#### Scenario: Style lock is generated once
- GIVEN a post whose research has been approved
- WHEN the owner requests a style lock
- THEN the system produces one style lock for the post
- AND stores it on the post

#### Scenario: Style lock is reusable, not per-slide
- GIVEN a post with a stored style lock and slide_count=5
- WHEN slides are generated
- THEN all five slides use the same stored style lock
- AND the system does not produce a separate style lock per slide

#### Scenario: Style lock holds aesthetic properties only
- GIVEN a generated style lock
- WHEN it is inspected
- THEN it describes visual medium, colour palette, typography treatment, line and shape language, and background treatment
- AND it contains no engineering fact, number, material, dimension, named method, or standard

### Requirement: Style Lock Review
The system SHALL allow the owner to view, edit, and regenerate the style lock before slides are generated, and SHALL treat the owner's edited text as authoritative.

#### Scenario: Owner edits the style lock
- GIVEN a post with a stored style lock
- WHEN the owner edits the text and saves it
- THEN the edited text is stored
- AND subsequent slide generation uses the edited text as written

#### Scenario: Owner regenerates the style lock
- GIVEN a post with a stored style lock
- WHEN the owner explicitly requests regeneration
- THEN a new style lock replaces the stored one

#### Scenario: Slide regeneration preserves the style lock
- GIVEN a post with a stored style lock and previously generated slides
- WHEN the owner regenerates the slides without requesting a new style lock
- THEN the stored style lock is unchanged
- AND the regenerated slides use the same style lock text

#### Scenario: Edited style lock is not silently reconciled
- GIVEN an owner-edited style lock that conflicts with the selected visual command
- WHEN slides are generated
- THEN the owner's text is used as written
- AND the system does not rewrite it to match the visual command

### Requirement: Style Lock Gate
The system SHALL require a stored style lock before slides can be generated.

#### Scenario: Generation without a style lock is blocked
- GIVEN a post with approved research and no stored style lock
- WHEN the owner triggers slide generation
- THEN the system does not generate slides
- AND the owner is directed to produce a style lock first

#### Scenario: Style lock requires approved research
- GIVEN a post whose research has not been approved
- WHEN a style lock is requested
- THEN the system does not produce one
