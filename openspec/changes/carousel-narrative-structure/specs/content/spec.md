# Content Delta

## MODIFIED Requirements

### Requirement: Slide Count Range
The system SHALL accept a slide count between 5 and 10 inclusive, and SHALL default new posts to 7.

#### Scenario: Accept the supported range
- GIVEN an authenticated owner creating a post
- WHEN the owner submits a slide_count of 5, 7, or 10
- THEN the system persists the post with that slide count

#### Scenario: Reject a count below the minimum
- GIVEN a post submission with slide_count=4
- WHEN the submission is received
- THEN the system rejects it with a validation error
- AND the post is not persisted

#### Scenario: Reject a count above the maximum
- GIVEN a post submission with slide_count=11
- WHEN the submission is received
- THEN the system rejects it with a validation error
- AND the post is not persisted

#### Scenario: Default slide count
- GIVEN an authenticated owner creating a post without specifying a slide count
- WHEN the post is persisted
- THEN the slide count is 7

#### Scenario: Legacy slide counts are raised to the minimum
- GIVEN an existing post with a slide count below 5
- WHEN the post is migrated
- THEN its slide count becomes 5
- AND previously generated prompt content is not silently rewritten

## REMOVED Requirements

### Requirement: Three-to-Seven Slide Range (REMOVED)
The previous 3–7 slide range with a default of 5 is REMOVED. Three slides cannot carry a hook, a standalone second slide, value slides, and a closing action for educational content.

#### Scenario: Three slides are no longer accepted
- GIVEN a post submission with slide_count=3
- WHEN the submission is received
- THEN the system rejects it with a validation error
