# Auth Delta

## ADDED Requirements

### Requirement: Owner Authentication
The system SHALL authenticate a single owner account using a stored password credential and issue a server-side session upon success. The system MUST NOT expose public self-registration in the MVP.

#### Scenario: Successful owner login
- GIVEN a provisioned owner account
- WHEN the owner submits valid credentials
- THEN the system establishes an authenticated session
- AND the owner can access the owner workspace

#### Scenario: Invalid credentials
- GIVEN the login form
- WHEN invalid credentials are submitted
- THEN the system rejects the login with an error
- AND no session is established

#### Scenario: No public registration
- GIVEN an unauthenticated visitor
- WHEN the visitor looks for a signup or registration path
- THEN no public registration capability is available

### Requirement: Owner-Only Authorization
The system SHALL restrict post creation, editing, deletion, preset management, and prompt generation to the authenticated owner.

#### Scenario: Unauthenticated mutation is blocked
- GIVEN an unauthenticated request to a protected owner action
- WHEN the request is received
- THEN the system rejects it with an unauthorized status
- AND the action does not take effect

#### Scenario: Authenticated owner mutation succeeds
- GIVEN an authenticated owner session
- WHEN the owner performs a protected action within their permissions
- THEN the system authorizes and performs the action

### Requirement: Session Secret Confidentiality
The system MUST read session and credential secrets from runtime configuration and MUST NOT expose them to the client or logs.

#### Scenario: Secret never sent to client
- GIVEN any client-facing response
- WHEN the response is produced
- THEN it does not contain session secrets, credential hashes, or provider API keys
