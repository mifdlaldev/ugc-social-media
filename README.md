# UGC Social Media — Prompt-to-Infographic for Civil Engineering Education

A **single-creator web app** that turns your educational articles (teknik sipil, konstruksi, arsitektur) into **structured, copy-ready image-generation prompts** for external tools (ChatGPT/GPT Image, Nano Banana, and other image generators). The resulting infographics are meant to be posted on Instagram, Facebook, and other social media.

> **The app generates prompts, not images.** Production of the image happens in external tools you choose.

## How It Works

1. **You write an article** — e.g. "Kenapa kolom lebih kokoh daripada dinding tanpa struktur?"
2. **The app converts it** — via a text LLM on an **OpenAI-compatible gateway** (`LLM_BASE_URL`) into **structured prompt blocks**: visual style, composition, color palette, typography, layout, on-image text, aspect ratio, and per-tool notes.
3. **You copy the blocks** — into ChatGPT/GPT Image, Nano Banana, or another generator.
4. **You post the infographic** — to Instagram / Facebook.

## Tech Stack (fixed — see `AGENTS.md`)

| Layer           | Choice                                                                |
| --------------- | --------------------------------------------------------------------- |
| Frontend        | SvelteKit (Svelte 5 runes, Tailwind v4)                               |
| Backend         | ElysiaJS (mounted at `/api` via hooks.server.ts)                      |
| Package manager | Bun                                                                   |
| ORM             | Drizzle ORM                                                           |
| Database        | SQLite (local: `bun:sqlite`/`libsql`; production: Cloudflare D1)      |
| Components      | shadcn-svelte                                                         |
| Deploy          | Cloudflare Workers (wrangler)                                         |
| AI provider     | OpenAI-compatible gateway (text → prompt blocks), from `LLM_BASE_URL` |

## Quick Start

```bash
bun install
cp .env.example .env.local   # fill DATABASE_URL, LLM_BASE_URL, LLM_API_KEY, LLM_MODEL, etc.
bun run db:migrate
bun dev
```

For production parity with the D1 binding:

```bash
bunx wrangler dev
bunx wrangler deploy          # requires Cloudflare auth + D1 database
```

Environment variables are documented in `AGENTS.md` §Environment Variables. Never commit real secrets.

## Repository Layout

```
.
├── AGENTS.md        # instructions for AI coding agents
├── README.md
├── DESIGN.md        # architecture, data model, AI pipeline, decisions
├── openspec/
│   ├── config.yaml  # OpenSpec project config
│   ├── specs/       # source-of-truth behavior specs
│   └── changes/     # active changes (proposal/specs/design/tasks)
├── src/
│   ├── hooks.server.ts   # routes /api/* to Elysia, rest to SvelteKit
│   ├── lib/
│   │   ├── server/api.ts # Elysia app definition
│   │   └── components/   # shadcn-svelte components
│   ├── routes/           # SvelteKit pages
│   └── app.d.ts          # Cloudflare Platform types
├── drizzle/         # schema.ts + migrations
├── static/
├── wrangler.toml
└── package.json
```

## Spec-Driven Development

All behavior is specified in `openspec/`. Work happens as **changes**:

```text
openspec/changes/<change-name>/proposal.md + specs/ + design.md + tasks.md
```

Required reading before touching code: `AGENTS.md`, `DESIGN.md`, and the relevant specs in `openspec/`.

## Prompt Command Reference

`docs/prompt-command-reference.md` is a verbatim catalog of the two owner-supplied PDFs:

- `500 Perintah Rahasia ChatGPT.pdf` — 500 commands in 5 sections; Bagian 3 (201–300) is the AI-image section, Bagian 1 (1–51) covers information layout.
- `kumpulan command.pdf` — 50 commands by Ahmad Fauzi, each with a short (`/command <topik>`) and a detailed prompt form.

The catalog is a **reference for redesigning prompt generation**, not a feature list and not permission to add engineering facts. Facts still come only from You.com research plus the owner's topic. See `AGENTS.md` §Image Prompt Command Rules.

## Status

- 🚧 **§1 Scaffolding in progress** — SvelteKit + Elysia + shadcn-svelte + Cloudflare Workers
