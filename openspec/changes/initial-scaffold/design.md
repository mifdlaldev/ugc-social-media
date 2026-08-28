# Design: Initial Scaffold — Article-to-Prompt MVP

## Technical Approach

Build a single TypeScript application with SvelteKit for the UI and ElysiaJS for typed server routes. Keep business rules in services, database access in Drizzle-backed repositories, and prompt parsing/fidelity checks as isolated testable modules.

Use SQLite-compatible schema design so the same relational model can run locally and on Cloudflare D1. The exact adapter and runtime integration must be verified against installed dependencies during scaffolding.

## Architecture Decisions

### Decision: Prompt-only MVP

The app does not call image-generation APIs and does not upload or publish images. This keeps the first release focused on the creator's article-to-prompt workflow and avoids inventing external provider behavior.

### Decision: OpenRouter only for text transformation

OpenRouter is the configured gateway for the text LLM request. The model identifier comes from `OPENROUTER_MODEL` at runtime and must not be guessed or hardcoded as a product fact.

### Decision: Article is the factual boundary

The article body is the only source of engineering facts. Presets may control presentation intent, but no preset, application code, search result, or model memory may inject factual engineering claims.

### Decision: Structured JSON contract

The prompt generator returns the `PromptGenerationResult` contract in `DESIGN.md`. The parser and schema validator are separate from the provider client so malformed provider output cannot leak into the UI as a successful result.

### Decision: Persist every generation attempt

Successful and failed attempts are stored with safe metadata for quality iteration. Secrets and authorization headers are excluded. Retention can be refined in a later operational change.

## Data Flow

```text
Owner submits article/preset
  → authenticated Elysia route
  → input validation
  → input hash
  → promptGenerator service
  → OpenRouter text request
  → generation attempt raw record
  → fence/prose removal
  → JSON parse
  → schema validation
  → fact-fidelity guard
  → generation attempt final status
  → structured response to Svelte UI
  → copy one block or all blocks
```

## Module Boundaries

- `src/index.ts`: application entry and Worker-compatible export.
- `src/routes/`: typed route groups and request/response schemas.
- `src/services/promptGenerator.ts`: orchestration of normalization, provider call, parsing, validation, and fidelity guard.
- `src/services/promptParser.ts`: defensive extraction and JSON parsing.
- `src/services/factFidelityGuard.ts`: conservative article/output checks; failures are explicit and never treated as proof of correctness.
- `src/services/openRouterClient.ts`: server-only provider client with runtime configuration.
- `src/db/` or equivalent repository modules: Drizzle queries and database selection.
- `drizzle/schema.ts`: all relational tables and constraints.
- `src/lib/`: Svelte UI state, API clients, and components.

Exact paths may be adjusted during scaffolding only if the behavior and boundaries remain intact and the change artifacts are updated.

## Initial API Contract Direction

Implement typed routes for:

- owner session login/logout/current session
- public published post list/detail
- owner post CRUD and publication state
- categories/tags used by post authoring and feed filters
- prompt preset list and owner management
- prompt generation for an owner post

Public likes, bookmarks, and comments are out of MVP scope and have no API surface.

## Verification Strategy

- Unit tests for markdown-fence/prose JSON extraction.
- Unit tests for schema rejection and missing required blocks.
- Unit tests for the fact-fidelity guard, including unsupported numbers and terms.
- Route tests with Elysia's `app.handle(new Request(...))` style.
- Database tests with a real local SQLite file and the actual Drizzle schema.
- Run `bun run check` and `bun run lint` after implementation, if those scripts exist. If either script is absent, ask before creating one.
- Verify exact dependency APIs, OpenRouter request shape, SvelteKit adapter, Elysia Cloudflare Worker integration, and Drizzle D1 setup against installed packages and official documentation rather than guessing.
