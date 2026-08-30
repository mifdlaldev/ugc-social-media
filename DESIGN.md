# DESIGN.md

## 1. Product Definition

This project is a single-creator publishing assistant for an architect who creates public education about civil engineering, construction, architecture, and related topics.

The product's primary transformation is:

```text
Creator's article + selected prompt preset
        ↓
Text LLM through OpenRouter
        ↓
Validated structured prompt blocks
        ↓
Creator copies prompt to an external image generator
        ↓
Creator creates and publishes an infographic externally
```

The system does not generate, store, or publish images in the MVP. It does not automatically rewrite the article, add outside facts, or publish to social networks.

## 2. Scope and Non-Goals

### MVP scope

- One owner/creator account and authenticated owner workspace (single pre-provisioned password account).
- Creation, editing, listing, viewing, and deletion of educational posts.
- Topic/category and tag metadata.
- Public feed and public post detail pages.
- Structured prompt generation from the creator's article.
- Prompt presets for social platform intent and aspect ratio.
- Copyable prompt blocks, including per-tool notes.
- Persisted generation attempts for debugging and quality iteration (auto-deleted after 90 days).

### Deferred to later changes

- Comments on public posts (moderation policy TBD).
- Post likes (anonymous or authenticated TBD).
- Bookmarks (requires public user accounts).
- Image upload, gallery, or in-app image generation.
- Multi-creator registration and public author profiles.

### Explicit non-goals

- Direct image generation inside this application.
- Direct Instagram, Facebook, or other social-media publishing.
- Image upload or image gallery in the MVP.
- Multi-creator registration, roles, or public author profiles.
- Automatic article rewriting or topic ideation by AI.
- Adding engineering facts from web search, model memory, or any source other than the supplied article.
- Claiming that a generated prompt is technically or structurally authoritative.

If a future request conflicts with these non-goals, create and approve an OpenSpec change first.

## 3. Monorepo Layout

The repository uses a single application layout:

- SvelteKit provides the browser-facing frontend and application shell.
- ElysiaJS provides the typed backend API.
- The API and frontend are developed from the same repository and deployed together as a Cloudflare Worker-compatible application, subject to validating the chosen SvelteKit adapter and Elysia integration during scaffolding.
- Local development uses Bun and a local SQLite database.
- Production uses a Cloudflare D1 binding through Drizzle's D1 driver.

This is a deliberate MVP decision. Do not split into separate repositories or add another frontend/backend framework without an approved change.

## 4. Architecture

```text
Browser
  │
  ├── SvelteKit pages and components
  │
  └── HTTP requests
          │
          ▼
      ElysiaJS API
          │
          ├── Request validation and authentication
          ├── Post, category, tag services
          ├── Prompt generation service
          │       ├── Input normalization
          │       ├── Article-only system/user prompt
          │       ├── OpenRouter text request
          │       ├── Defensive JSON extraction
          │       ├── Schema validation
          │       └── Fact-fidelity guard
          │
          └── Drizzle ORM
                  │
                  ├── Local SQLite
                  └── Cloudflare D1
```

### Runtime boundaries

- Secrets are read from runtime environment/bindings, never from client code.
- The browser never calls OpenRouter directly.
- The browser never receives the OpenRouter API key.
- Database access is server-side only.
- AI output is untrusted input and must be parsed and validated before it is returned or persisted as a successful result.

## 5. Domain Model

The initial domain model is relational and SQLite-compatible.

### `users`

The owner account for the MVP. A single account is pre-provisioned via configuration (`ADMIN_PASSWORD_HASH`); there is no public registration. The schema should permit future extension but must not implement public registration unless specified by a later change.

Key fields:

- `id`
- `email` or owner identifier
- `password_hash` or equivalent credential reference
- `role`
- `created_at`
- `updated_at`

### `posts`

An educational article and its publishable public metadata.

Key fields:

- `id`
- `author_id`
- `title`
- `slug`
- `article_body` (maximum 10,000 characters)
- `excerpt` if used by the approved UI
- `status` such as draft or published
- `created_at`
- `updated_at`
- `published_at`

### `categories`

Controlled high-level topics. The initial approved taxonomy is:

- Struktur & Statika
- Arsitektur & Desain
- Material & Konstruksi
- Infrastruktur & Transportasi
- MEP & Utilitas
- Tips & Tools Praktis

Categories are seeded, not AI-generated. Adding or renaming categories is an owner-controlled action.

Key fields:

- `id`
- `name`
- `slug`
- `created_at`

### `post_categories`

Many-to-many relation between posts and categories.

### `tags`

User-selected or owner-managed topic labels. Do not use AI to invent tags unless a later spec explicitly allows it.

Key fields:

- `id`
- `name`
- `slug`

### `post_tags`

Many-to-many relation between posts and tags.

> Deferred tables (not part of MVP schema): `comments`, `likes`, `bookmarks`. They require an approved identity/moderation policy and (for bookmarks) public user accounts, which are out of MVP scope.

### `prompt_presets`

Owner-controlled preset values that shape visual output intent without adding article facts. A preset is not a template for the article; it steers the visual direction of the generated prompt.

Initial approved preset catalog:

| Preset name            | Platform intent          | Aspect ratio | Notes                       |
| ---------------------- | ------------------------ | ------------ | --------------------------- |
| Instagram Post (1:1)   | Instagram square post    | `1:1`        | Default social post format  |
| Instagram Story (9:16) | Instagram vertical story | `9:16`       | Full-screen vertical format |
| Facebook Post (4:5)    | Facebook feed portrait   | `4:5`        | Common feed image ratio     |

A preset may define:

- target platform or use case
- aspect ratio
- language preference for on-image text
- visual tone
- tool-specific formatting notes (e.g. GPT Image vs Nano Banana quirks)

Presets must not contain hidden factual engineering content. Adding or modifying presets is an owner-controlled action.

### `generation_attempts`

One record per prompt-generation request, including failures.

Key fields:

- `id`
- `post_id` or source article reference
- `input_hash`
- `model_id`
- `preset_snapshot`
- `raw_output`
- `parsed_result` when parsing succeeds
- `status`
- `error_code` and safe error detail when applicable
- `created_at`

Do not persist API keys, authorization headers, or unnecessary personal data.

Retention: generation attempts are retained for **90 days**, then automatically deleted. The deletion mechanism (scheduled job vs. on-write cleanup) is defined in an operational task during implementation.

## 6. Prompt Block Schema

This schema is the contract between the generation service and the UI. Any change requires updates to this document and the relevant OpenSpec spec before implementation.

```ts
type PromptBlock = {
	id: string;
	label: string;
	content: string;
};

type PromptGenerationResult = {
	schemaVersion: string;
	sourceSummary: string;
	blocks: {
		visualStyle: PromptBlock;
		composition: PromptBlock;
		colorPalette: PromptBlock;
		typography: PromptBlock;
		layout: PromptBlock;
		onImageText: PromptBlock;
		aspectRatio: PromptBlock;
		toolNotes: PromptBlock[];
	};
	fidelityNotes: string[];
};
```

### Schema rules

- `sourceSummary` may summarize only the supplied article.
- Every factual statement, number, material, dimension, named method, engineering term, and claim in the result must be traceable to the supplied article.
- Creative direction is allowed only where it does not introduce factual claims.
- If the article does not provide a fact needed for a requested block, the output must say that the information is unspecified or omit it; it must not guess.
- `toolNotes` may explain formatting or prompt syntax differences, but may not add engineering facts.
- `fidelityNotes` records limitations or items that were not specified in the article.
- The UI must not present the output as verified engineering advice.

### Prompt command catalog (reference only)

`docs/prompt-command-reference.md` holds a verbatim extraction of the two owner-supplied PDFs:

- `500 Perintah Rahasia ChatGPT.pdf` — 500 commands across 5 sections. Bagian 3 (201–300) is the PDF's own AI-image / photography / cinematic-style / art-design section. Bagian 1 (1–100) holds visual-explanation and layout commands.
- `kumpulan command.pdf` — 50 commands by Ahmad Fauzi, each documented in a short form (`/command <topik>`) and a detailed form that adds concrete elements, style, layout, format, and text language.

Status: **reference material, not an approved feature.** The catalog does not change this schema, the pipeline in §7, or the fact-fidelity boundary. Any redesign of prompt generation that draws on the catalog requires a new OpenSpec change (proposal → specs → design → tasks) approved before implementation. Slash commands in those PDFs are prompt-writing conventions; they are not verified native commands of ChatGPT, GPT Image, Nano Banana, or Recraft.

## 7. AI Pipeline

### Input

- Article title and body supplied by the creator.
- Optional approved prompt preset.
- Server-selected OpenRouter text model from `OPENROUTER_MODEL`.

### System instruction requirements

The generation system instruction must state that:

1. The article is the only source of factual content.
2. No external knowledge, web search, model memory, invented numbers, materials, dimensions, standards, citations, or technical claims may be added.
3. Missing information must be marked as unspecified.
4. The response must be valid JSON matching the prompt block schema.
5. The task is prompt structuring, not engineering validation and not image generation.

### Processing

1. Validate input length and required fields.
2. Normalize article and preset data.
3. Create an input hash for the attempt record.
4. Send a server-side request to the verified OpenRouter text endpoint using the configured model.
5. Persist the raw response and metadata, without secrets.
6. Remove an optional markdown code fence or surrounding prose defensively.
7. Parse JSON.
8. Validate the result against the schema.
9. Run a fact-fidelity guard. The guard can reject obviously unsupported generated factual tokens and must never claim perfect semantic verification.
10. Persist success or failure status.
11. Return structured blocks or a clear retryable error.

### Failure behavior

- Missing configuration: safe server error; do not expose secret values.
- OpenRouter failure or timeout: retryable user-facing error.
- Invalid JSON: retryable error explaining that the model response could not be structured.
- Schema mismatch: retryable error; do not return empty blocks.
- Fidelity guard failure: do not present the result as successful; persist the attempt for review.
- Never silently replace missing output with invented defaults.

## 8. API Shape

The exact route schemas are defined by OpenSpec capability specs before implementation. The intended resource groups are:

- authentication/session
- public posts/feed/detail
- owner post management
- categories and tags
- prompt presets
- prompt generation

Likes, bookmarks, and comments are out of MVP scope and have no routes.

All Elysia routes must use explicit request validation and appropriate HTTP status codes. Server errors must use safe messages. Responses must not expose secrets or raw provider credentials.

## 9. Security and Privacy

- Hash passwords using a verified, maintained implementation available in the chosen runtime; do not invent a cryptographic scheme.
- Use secure, HttpOnly, SameSite cookies for sessions where supported by the deployment model.
- Validate and bound article, title, tag, and preset input lengths.
- Escape or safely render user-generated content (article content and any rendered text).
- Rate-limit prompt generation and authentication according to a later approved operational design.
- Protect owner-only mutations with server-side authorization.
- Do not log article contents, raw prompts, credentials, or provider secrets unless explicitly approved for a privacy-safe diagnostic requirement.
- Generation-attempt retention is 90 days with automatic deletion to be implemented per the approved mechanism.

## 10. UI and Accessibility

- Use Svelte 5 runes; do not use legacy Svelte reactivity syntax.
- Use shadcn-svelte components for standard UI primitives.
- The prompt result page must make every block readable and individually copyable, while also offering a copy-all action.
- Show the selected preset and aspect ratio clearly.
- Show generation status, failure, retry, and fidelity limitation states.
- The feed must work on mobile widths suitable for social-content workflows.
- Provide keyboard-accessible controls, visible focus states, labels, and sufficient contrast.
- Avoid decorative UI that obscures the article or prompt content.

## 11. Deployment and Environment

### Local

- Bun runs the development server.
- SQLite is used for local persistence.
- Secrets are supplied through an ignored `.env.local` or the runtime's local variable mechanism.

### Production

- Deploy to Cloudflare Workers.
- Bind a Cloudflare D1 database.
- Use Drizzle's D1-compatible driver.
- Set `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `SESSION_SECRET`, and `ADMIN_PASSWORD_HASH` as secrets/configuration through the deployment system.
- Do not put real values in `wrangler.toml`, source code, documentation, or committed example files.

The exact SvelteKit adapter, Elysia Worker adapter configuration, D1 database identifier, and migration command must be verified against the installed package versions and Cloudflare documentation during scaffolding. Do not guess them in advance.

## 12. Decisions and Open Questions

### Decided

- Single creator first; public feed and public reading are part of the MVP direction.
- Text LLM only; no in-app image generation.
- OpenRouter is the AI gateway.
- Article facts are the sole factual source for generated prompts.
- Structured prompt blocks are the canonical output.
- Svelte, ElysiaJS, Bun, Drizzle, SQLite, shadcn-svelte, and Cloudflare Workers are fixed choices.
- Owner auth is a single pre-provisioned password account (`ADMIN_PASSWORD_HASH`); no public registration, no magic link.
- Comments, likes, and bookmarks are deferred out of the MVP (require identity/moderation policy and public accounts).
- Initial category taxonomy: Struktur & Statika, Arsitektur & Desain, Material & Konstruksi, Infrastruktur & Transportasi, MEP & Utilitas, Tips & Tools Praktis.
- Initial preset catalog: Instagram Post (1:1), Instagram Story (9:16), Facebook Post (4:5).
- Maximum article length: 10,000 characters. (Comment length deferred with comments feature.)
- Generation-attempt retention: 90 days, then auto-delete.

### Must be confirmed before implementation

- Exact Cloudflare/SvelteKit/Elysia integration after dependencies are installed.
- Exact OpenRouter text model identifier from runtime configuration. Model IDs must never be guessed or hardcoded as facts in the application.
- Deletion mechanism for the 90-day retention (scheduled Cloudflare cron vs. on-write cleanup).

## 13. Change Control

Behavior changes are proposed in `openspec/changes/<change-name>/`. Once approved and implemented, archive the change so its delta specs merge into `openspec/specs/`. If implementation discovers a contradiction or missing requirement, stop, update the artifacts, and ask for approval rather than silently changing scope.
