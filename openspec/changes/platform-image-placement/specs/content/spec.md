# Content Delta

## MODIFIED Requirements

### Requirement: Owner Post Authoring
The system SHALL allow the authenticated owner to create, edit, and delete social media posts with a topic, image placement, visual command, and slide count.

#### Scenario: Create a social media post
- GIVEN an authenticated owner
- WHEN the owner submits a valid topic, platform_placement, visual_command, and slide_count (3-7)
- THEN the system persists the post as a draft
- AND the post appears in the owner workspace

#### Scenario: Edit a post
- GIVEN an existing post owned by the owner
- WHEN the owner updates the topic, platform_placement, visual_command, or slide_count with valid values
- THEN the system saves the changes

#### Scenario: Reject invalid post input
- GIVEN a post submission with an empty topic, an unsupported platform_placement or visual_command value, or slide_count outside 3-7
- WHEN the submission is received
- THEN the system rejects it with a validation error
- AND the post is not persisted

### Requirement: Image Placement Configuration
The system SHALL support exactly thirteen single-image placements as a fixed enum on each post. The thirteen values SHALL be `instagram-feed-square`, `instagram-feed-portrait`, `instagram-feed-landscape`, `instagram-stories`, `facebook-feed-square`, `facebook-feed-portrait`, `facebook-stories`, `x-instream-single-image`, `youtube-community-image`, `linkedin-single-image-portrait`, `linkedin-single-image-square`, `linkedin-single-image-landscape`, and `pinterest-standard-pin`.

#### Scenario: Placement carries an exact canvas
- GIVEN the placement `instagram-feed-portrait`
- WHEN the owner views the selection control
- THEN the option states the platform, the placement, the pixel canvas 1080 × 1350, and the ratio 4:5

#### Scenario: Placement determines the target canvas for generation
- GIVEN a post with platform_placement=`pinterest-standard-pin`
- WHEN the system generates prompt slides
- THEN the target canvas is 1000 × 1500 at ratio 2:3

#### Scenario: Reject a placement outside the curated set
- GIVEN a post submission with platform_placement=`tiktok-photo-post`
- WHEN the submission is received
- THEN the system rejects it with a validation error
- AND the post is not persisted

#### Scenario: Placement is chosen at post creation
- GIVEN the owner is creating or editing a post
- WHEN the owner opens the image placement control
- THEN all thirteen placements are selectable, grouped by platform
- AND the selection is stored on the post rather than being chosen during generation

### Requirement: Placement Source Provenance
The system SHALL record, for every placement, a source URL and a source status describing how authoritative its figures are, and SHALL surface that status to the owner rather than presenting every figure as officially specified.

#### Scenario: Officially specified placement
- GIVEN the placement `pinterest-standard-pin`, whose canvas, ratio, and file limits are documented by the platform
- WHEN the owner views the placement
- THEN its source status indicates an official specification

#### Scenario: Derived canvas is not presented as official
- GIVEN the placement `x-instream-single-image`, where the platform documents a ratio range and a file limit but not the pixel canvas
- WHEN the owner views the placement
- THEN its source status indicates that the canvas is derived rather than officially mandated

#### Scenario: No placement without a source
- GIVEN the placement catalog
- WHEN the catalog is validated
- THEN every entry has a non-empty source URL and a non-empty source status

#### Scenario: Undocumented placements are absent
- GIVEN the placement catalog
- WHEN the catalog is inspected
- THEN it contains no entry for Threads feed, WhatsApp Status, KASKUS thread image, or TikTok photo post

## REMOVED Requirements

### Requirement: Platform Configuration (REMOVED)
The three-value `platform` enum (`instagram`, `facebook`, `linkedin`) is REMOVED from posts. A platform name does not identify a placement, and one platform supports several placements with different canvases.

#### Scenario: Platform alone is not accepted
- GIVEN a post submission containing a bare `platform` value such as `instagram`
- WHEN the submission is received
- THEN `platform` is not persisted on the post
- AND the target canvas is determined by `platform_placement`

### Requirement: Single Aspect Ratio Per Platform (REMOVED)
The behavior of deriving exactly one aspect ratio per platform is REMOVED. It was inaccurate, because a platform may officially accept a range of ratios.

#### Scenario: Ratio comes from the placement
- GIVEN two posts, one with `instagram-feed-square` and one with `instagram-feed-portrait`
- WHEN prompts are generated for each
- THEN the first targets 1:1 and the second targets 4:5
