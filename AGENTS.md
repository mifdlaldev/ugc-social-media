## Project Configuration

- **Language**: TypeScript
- **Package Manager**: npm
- **Add-ons**: tailwindcss, vitest, prettier, eslint

---

# AGENTS.md

Instructions for AI coding agents working on this repository.

## Project Purpose

Build a **UGC social media platform for civil engineering, construction, and architecture education** — but the MVP ships as a **single-creator** tool owned by an architect.

Core value loop:

1. Owner writes an **educational article** (teknik sipil / konstruksi / arsitektur).
2. The app sends the article to a **text LLM via OpenRouter**.
3. The LLM converts the article into **structured, copy-ready prompt blocks** (visual style, composition, color palette, typography, layout, on-image text, aspect ratio, per-tool notes).
4. The owner copies the blocks into an **external image generator** (ChatGPT/GPT Image, Nano Banana / Gemini, etc.).
5. The generated **infographic** is posted to Instagram / Facebook.

The app **generates prompts, not images**. Images are produced in external tools by the user.

## Non-Negotiable Rules (Read First)

### 1. NEVER HALLUCINATE

- **Never invent package versions, model IDs, API schemas, or CLI flags.** If you are not sure, verify against the real docs (`webfetch`, package.json, drizzle-kit config, official docs) before writing code or docs.
- **Never invent product features.** Only implement what is written in `openspec/specs/` (or the active change in `openspec/changes/`). If a requirement is missing, ask, do not assume.
- **Never add AI "magic" behavior** (e.g., image generation, autosuggest, LLM rewriting of the article) that is not specified.
- **Never change the tech stack.** Fixed stack (below). No new frameworks "for convenience".
- **Do not assume facts about the engineering content.** The LLM prompt-generation must only derive factual claims from the article text provided by the user. The app must never inject external "known facts" into the prompt blocks.

### 2. Spec-Driven Workflow

- `openspec/specs/` is the **source of truth** for behavior.
- Active work lives in `openspec/changes/<change-name>/` (proposal.md → specs/ → design.md → tasks.md).
- **Do not write implementation code for a change before its artifacts are approved.**
- When implementation diverges from the spec, update the spec artifacts (proposal/specs/design/tasks) instead of silently deviating.
- After completing a change, archive it (`openspec archive`) so its delta specs merge into `openspec/specs/`.

### 3. Read Before You Write

Before editing any code, read:

- `AGENTS.md` (this file)
- `README.md` (human overview)
- `DESIGN.md` (architecture, data model, AI pipeline, decisions)
- Relevant `openspec/specs/**/spec.md` and the active change folder

## Fixed Tech Stack

| Concern         | Choice                 | Notes                                                                                                                                        |
| --------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend        | **Svelte** (SvelteKit) | Svelte 5 runes; do NOT use legacy `$:` / `export let` patterns                                                                               |
| Backend         | **ElysiaJS**           | Elysia ~1.x, TypeScript-first                                                                                                                |
| Package manager | **Bun**                | `bun.lockb`; never commit `package-lock.json` / `yarn.lock`                                                                                  |
| ORM             | **Drizzle ORM**        | schema in `drizzle/schema.ts`                                                                                                                |
| Database        | **SQLite**             | Local dev: `bun:sqlite` / `libsql`. Production on Cloudflare: **D1** (Cloudflare's serverless SQLite). Drizzle D1 driver (`drizzle-orm/d1`). |
| Components      | **shadcn-svelte**      | via `bunx shadcn-svelte@latest add <component>`                                                                                              |
| Deploy          | **Cloudflare Workers** | wrangler + `wrangler.toml`; D1 binding for production                                                                                        |
| AI provider     | **OpenRouter**         | text LLM via `/api/v1/chat/completions`; API key from secret/env                                                                             |

## Repository Layout (actual)

```
.
├── AGENTS.md
├── README.md
├── DESIGN.md
├── openspec/
│   ├── config.yaml
│   ├── specs/                    # source of truth (merged from archived changes)
│   └── changes/                  # active + archived changes
├── src/
│   ├── hooks.server.ts           # routes /api/* to Elysia, rest to SvelteKit
│   ├── routes/                   # SvelteKit pages
│   └── lib/
│       ├── server/api.ts         # Elysia app definition (backend)
│       ├── server/db.ts          # Drizzle client (bun:sqlite, local)
│       └── components/ui/        # shadcn-svelte components
├── drizzle/
│   ├── schema.ts
│   ├── migrations/
├── data/                         # local SQLite file (gitignored)
├── static/
├── wrangler.toml
└── package.json
```

## Commands

```bash
bun install            # install dependencies
bun dev                # run dev server (Elysia) — local SQLite
bun run db:generate    # drizzle-kit generate (creates SQL migration from schema)
bun run db:migrate     # apply migrations to local DB
bun run db:studio      # drizzle studio (optional, inspect DB)
bun run lint           # lint (configured in project; if absent, ask)
bun run check          # svelte-check / tsc typecheck
wrangler dev           # run locally with D1 binding (production parity)
wrangler deploy        # deploy to Cloudflare Workers
```

Run `bun run check` (typecheck) and `bun run lint` after finishing any task. If a script is missing from `package.json`, ask before inventing one.

## Installed Tooling and Skills

### OpenSpec CLI

Installed globally (`@fission-ai/openspec`, v1.11.0). Use it for the spec-driven workflow:

```bash
openspec list                 # active changes
openspec validate <change>    # validate a change's artifacts
openspec show <change>        # inspect a change
openspec archive <change>     # merge delta specs into openspec/specs/ and archive
```

The active change is `openspec/changes/initial-scaffold/`. `openspec/specs/` is empty until the first change is archived.

### Installed skills (project `.agents/skills/`, auto-loaded by opencode)

| Skill                        | Source                  | Purpose                                                                             |
| ---------------------------- | ----------------------- | ----------------------------------------------------------------------------------- |
| `shadcn-svelte`              | huntabyte/shadcn-svelte | Correct component composition, imports, theming, CLI usage                          |
| `frontend-design`            | anthropics/skills       | Intentional, non-generic visual design for UI work                                  |
| `tdd`                        | mattpocock/skills       | Red-green-refactor test-driven development                                          |
| `code-review`                | mattpocock/skills       | Review diff against spec/standards before commit                                    |
| `diagnosing-bugs`            | mattpocock/skills       | Disciplined reproduce→minimize→hypothesize→fix loop                                 |
| `git-guardrails-claude-code` | mattpocock/skills       | Reference for blocking dangerous git commands (its hook format targets Claude Code) |

The actual git safety for this project is enforced by `opencode.json` `permission.bash` rules (deny `git push`, `git reset --hard`, `git clean`, `git branch -D`, `git checkout .`, `git restore .`). Do not bypass these.

### Update skills

```bash
npx skills@latest update           # pull latest versions of installed skills
```

Manage via `skills-lock.json` at the project root.

## Code Conventions

- TypeScript **strict**. No `any` unless absolutely required and justified.
- Use **Elysia typed routes** (`.get`, `.post`, `.put`, `.delete`, `.onError`) with `t` schemas for request/response validation.
- All Drizzle tables defined in `drizzle/schema.ts`; export types with `typeof table`.
- Validation errors → proper HTTP status codes (400/404/409/422) via Elysia error handlers.
- **Secrets**: never log, hardcode, or commit API keys. Read from `env` / `.dev.vars` / Cloudflare secrets.
- Frontend: Svelte 5 runes (`$state`, `$props`, `$derived`, `$effect`). shadcn-svelte components only (don't hand-roll UI primitives that shadcn already provides).
- Commit messages: conventional (`feat:`, `fix:`, `docs:`, `chore:`).
- No AI-generated placeholder content. If seed/sample content is needed, mark it clearly as `[sample]` and ask the owner for real content.

## Image Prompt Command Rules

- The owner-supplied reference catalog is `docs/prompt-command-reference.md`, extracted from `500 Perintah Rahasia ChatGPT.pdf` and `kumpulan command.pdf`.
- Before redesigning image-prompt generation, read that catalog and the two source PDFs. Do not invent, rename, or silently reinterpret commands, command descriptions, prompt patterns, provider capabilities, or image-generation syntax.
- The slash commands in the PDFs are prompt-writing conventions, not assumed native ChatGPT or image-generator API commands. Treat them as selectable style/layout directives only when the approved spec explicitly requires that behavior.
- The 50-command PDF distinguishes `/command <topic>` (short) from a detailed form that adds concrete elements, style, layout, format, and text-language instructions. Preserve this distinction when specified; do not add details that are not supported by the topic or approved research.
- The catalog is a reference, not permission to add facts. Every engineering fact, number, material, dimension, named method, or claim must still come only from the approved research and user topic.
- If a future requirement conflicts with the catalog or is not defined by the current OpenSpec, stop and ask the owner before implementation.

## Prompt Generation Service Rules

Before changing prompt generation, update the relevant OpenSpec proposal/spec/design/tasks artifacts and obtain approval. The current implementation must not be changed based only on the PDF catalog.

The prompt-generation service (`src/lib/server/promptGenerator.ts`) is the heart of the product. Requirements:

- Input: article text (+ optional template/preset selected by the user).
- Output: **structured JSON** matching the block schema in `DESIGN.md §Prompt Block Schema`. Do not change the schema without updating DESIGN.md + openspec specs.
- **Fact fidelity**: instruct the LLM (in the system prompt) that every factual claim, number, material, and term in the output MUST come only from the supplied article. No invented data.
- **Robust parsing**: LLM output may be wrapped in markdown fences or contain prose. Parse defensively; fail with a clear user-facing error + retry hint, never silently return empty blocks.
- Persist each generation attempt (input hash, model, raw output, parsed result, timestamp) for debugging and quality iteration.

## Environment Variables

| Var                   | Required  | Description                                                 |
| --------------------- | --------- | ----------------------------------------------------------- |
| `DATABASE_URL`        | local dev | local SQLite path (e.g. `file:./data/local.db`)             |
| `OPENROUTER_API_KEY`  | yes       | OpenRouter key (production: Cloudflare secret)              |
| `OPENROUTER_MODEL`    | yes       | text model id (e.g. `openrouter/auto`), verified at runtime |
| `SESSION_SECRET`      | yes       | signs owner session cookies                                 |
| `ADMIN_PASSWORD_HASH` | yes       | owner login password hash (MVP single-creator)              |
| `ALLOWED_ORIGINS`     | dev       | CORS allowlist (dev only; same-origin in prod)              |

Never put real values in committed files. Use `.dev.vars` locally (wrangler) or `.env` + `.env.example` documenting keys only.

## Testing

- Unit-test the **prompt parser** and **fact-fidelity guard** — these are the highest-risk code paths.
- Test Drizzle schema with a real local SQLite file (no mocks of the DB).
- Elysia routes: `bun test` with a test client (Elysia `app.handle(new Request(...))`).
- Do not add a test framework or tool not already present without asking.

## Definition of Done

- [ ] Behavior matches the approved spec (openspec delta + source-of-truth)
- [ ] `bun run check` passes
- [ ] `bun run lint` passes
- [ ] Tests for new logic (parser, schema, routes)
- [ ] No hardcoded secrets; env docs updated
- [ ] Spec artifacts updated if behavior changed during implementation
