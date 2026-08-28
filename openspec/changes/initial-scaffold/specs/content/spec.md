# Content Delta

## ADDED Requirements

### Requirement: Owner Post Authoring
The system SHALL allow the authenticated owner to create, edit, and delete educational posts with a title, article body, category assignment, and optional tags.

#### Scenario: Create a post
- GIVEN an authenticated owner
- WHEN the owner submits a valid title and article body
- THEN the system persists the post as a draft
- AND the post appears in the owner workspace

#### Scenario: Edit a post
- GIVEN an existing post owned by the owner
- WHEN the owner updates the title or body with valid content
- THEN the system saves the changes

#### Scenario: Delete a post
- GIVEN an existing post owned by the owner
- WHEN the owner deletes the post
- THEN the system removes it from the feed and owner workspace

#### Scenario: Reject invalid post input
- GIVEN a post submission with an empty title or body, or content exceeding the configured maximum length
- WHEN the submission is received
- THEN the system rejects it with a validation error
- AND the post is not persisted

### Requirement: Post Publication State
The system SHALL distinguish between draft and published posts and MUST only display published posts in the public feed.

#### Scenario: Draft is hidden from public
- GIVEN a post in draft state
- WHEN a public visitor views the feed
- THEN the draft post is not listed

#### Scenario: Published post is visible
- GIVEN a post in published state
- WHEN a public visitor views the feed
- THEN the post is listed

### Requirement: Categories and Tags
The system SHALL support assigning one or more controlled categories and optional tags to a post, and MUST NOT auto-generate categories or tags via AI in the MVP.

#### Scenario: Filter feed by category
- GIVEN published posts assigned to categories
- WHEN a visitor filters the feed by a category
- THEN only posts in that category are shown

#### Scenario: Tags are owner-controlled
- GIVEN post authoring
- WHEN tags are added
- THEN they originate from the owner's input, not AI generation

### Requirement: Public Feed and Post Detail
The system SHALL provide a public feed listing published posts and a public detail page for each published post.

#### Scenario: View post detail
- GIVEN a published post
- WHEN a visitor opens its detail page
- THEN the system displays the article content and metadata

#### Scenario: Detail page for missing post
- GIVEN a request for a non-existent or unpublished post detail
- WHEN the page is requested
- THEN the system responds with a not-found result

### Requirement: No Public Engagement in MVP
The system MUST NOT implement public likes, bookmarks, or comments in the MVP. These require an approved identity/moderation policy and public user accounts, which are out of MVP scope.

#### Scenario: No like endpoint
- GIVEN the MVP API surface
- WHEN a client requests a post-like action
- THEN no like capability is available

#### Scenario: No comment endpoint
- GIVEN the MVP API surface
- WHEN a client requests a comment action
- THEN no comment capability is available

#### Scenario: No bookmark endpoint
- GIVEN the MVP API surface
- WHEN a client requests a bookmark action
- THEN no bookmark capability is available
