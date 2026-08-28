# Proposal: Initial Scaffold — MVP of Article-to-Prompt Infographic Platform

## Intent

Establish the foundational behavior of the application so that an architect-owner can turn educational articles about civil engineering, construction, and architecture into structured, copy-ready image-generation prompt blocks. The app generates prompts only; images are produced by the owner in external tools.

## Scope

In scope:

- Single-creator authentication and session.
- Owner-authored posts (articles) with title, body, category, and tags.
- Public feed and public post detail pages.
- Prompt presets for social platform intent and aspect ratio.
- Prompt generation from a post article via OpenRouter text model, returning structured prompt blocks.
- Copyable prompt blocks including per-tool notes.
- Persisted generation attempts for debugging (retained for 90 days, then auto-deleted).

Out of scope:

- In-app image generation.
- Direct publishing to Instagram/Facebook.
- Multi-creator registration and public author profiles.
- Automatic article rewriting or topic ideation by AI.
- Adding external engineering facts beyond the supplied article.
- Post likes, bookmarks, and public comments in the MVP.
- Public user registration or authenticated public user sessions.

## Approach

- SvelteKit frontend (Svelte 5 runes) + ElysiaJS typed API in a single repo.
- Drizzle ORM over SQLite locally and Cloudflare D1 in production.
- Prompt generation service calls the OpenRouter text endpoint, parses and validates JSON against the prompt block schema, and applies a fact-fidelity guard.
- Detailed technical design lives in `DESIGN.md`; this change's `design.md` and `tasks.md` drive implementation.
