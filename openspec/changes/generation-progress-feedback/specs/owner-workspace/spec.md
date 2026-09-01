# Owner Workspace Delta

## ADDED Requirements

### Requirement: Active Request Feedback
The owner workspace SHALL display a visible loading indicator while a research or generation request is in progress, and SHALL remove it when the request completes or fails.

#### Scenario: Research request is active
- GIVEN the owner starts research for a post
- WHEN the request is in progress
- THEN a loading indicator with a research stage label is visible
- AND the research action remains disabled until the request settles

#### Scenario: Style lock generation is active
- GIVEN the owner requests style-lock generation
- WHEN the request is in progress
- THEN a loading indicator with a style-lock stage label is visible

#### Scenario: Recommendation request is active
- GIVEN the owner requests a visual command recommendation
- WHEN the request is in progress
- THEN a loading indicator with a recommendation stage label is visible

#### Scenario: Slide generation is active
- GIVEN the owner starts prompt generation for a post
- WHEN the request is in progress
- THEN a loading indicator with a generation stage label is visible

#### Scenario: Indicator is removed on failure
- GIVEN a request fails
- WHEN the error is displayed
- THEN the loading indicator is no longer visible
- AND the existing error message is shown unchanged

### Requirement: Honest Progress Representation
The loading indicator SHALL NOT state a completion percentage, a remaining count, or an elapsed or estimated duration, because the API returns a single response per operation and reports no intermediate progress.

#### Scenario: No fabricated percentage
- GIVEN a loading indicator is visible
- WHEN it is inspected
- THEN it presents an indeterminate progress animation
- AND it contains no numeric percentage, step count, or time estimate

### Requirement: Non-Disruptive Feedback
The loading indicator SHALL preserve existing layout, controls, request behavior, and result handling.

#### Scenario: Existing behavior is unchanged
- GIVEN any supported action completes successfully
- WHEN the result is applied
- THEN the existing success, refresh, and navigation behavior is unchanged

#### Scenario: Reduced motion is respected
- GIVEN the viewer prefers reduced motion
- WHEN the loading indicator is visible
- THEN its animation is suppressed
- AND the busy state remains perceivable
