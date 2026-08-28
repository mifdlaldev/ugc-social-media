# Tasks: Initial Scaffold

## 1. Project Scaffolding
- [ ] 1.1 Initialize Bun project and confirm `bun install` works
- [ ] 1.2 Initialize SvelteKit app with Svelte 5 runes and TypeScript
- [ ] 1.3 Initialize ElysiaJS with typed routes
- [ ] 1.4 Install and configure shadcn-svelte (`bunx shadcn-svelte@latest init`)
- [ ] 1.5 Add first shadcn-svelte components (Button, Card, Input, Textarea, Badge, Tabs, Select, Toast)
- [ ] 1.6 Configure environment variable loading for local dev
- [ ] 1.7 Document any scripts added to `package.json` in `AGENTS.md`

## 2. Database Schema
- [ ] 2.1 Define Drizzle schema for `users`
- [ ] 2.2 Define Drizzle schema for `posts`
- [ ] 2.3 Define Drizzle schema for `categories` and `post_categories`
- [ ] 2.4 Define Drizzle schema for `tags` and `post_tags`
- [ ] 2.5 Define Drizzle schema for `prompt_presets`
- [ ] 2.6 Define Drizzle schema for `generation_attempts`
- [ ] 2.7 Run local migration and verify schema against a local SQLite file

## 3. Auth
- [ ] 3.1 Implement owner-only login route with validated credentials
- [ ] 3.2 Implement session creation using runtime secrets
- [ ] 3.3 Implement current-session route
- [ ] 3.4 Implement owner-only auth guard for protected actions
- [ ] 3.5 Confirm no public registration path exists

## 4. Posts and Feed
- [ ] 4.1 Implement public feed route listing published posts only
- [ ] 4.2 Implement public post detail route by slug/id
- [ ] 4.3 Implement owner post CRUD routes
- [ ] 4.4 Implement post publication state transitions
- [ ] 4.5 Implement category and tag filtering routes
- [ ] 4.6 Add feed page in SvelteKit
- [ ] 4.7 Add post detail page in SvelteKit
- [ ] 4.8 Add owner post authoring and edit page

## 5. Prompt Presets
- [ ] 5.1 Implement preset list route
- [ ] 5.2 Implement owner preset management route(s)
- [ ] 5.3 Add preset selection UI in the prompt workflow
- [ ] 5.4 Seed the approved preset catalog (Instagram Post 1:1, Instagram Story 9:16, Facebook Post 4:5)

## 6. Prompt Generation
- [ ] 6.1 Define prompt block schema contract in code
- [ ] 6.2 Implement `promptParser.ts` for fence/prose removal and JSON extraction
- [ ] 6.3 Implement schema validation for the generation result
- [ ] 6.4 Implement `factFidelityGuard.ts` with conservative checks
- [ ] 6.5 Implement `openRouterClient.ts` using runtime configuration
- [ ] 6.6 Implement `promptGenerator.ts` orchestration
- [ ] 6.7 Persist generation attempts (success and failure) with safe metadata
- [ ] 6.8 Implement generation route for an owner post
- [ ] 6.9 Implement prompt result UI with per-block copy and copy-all
- [ ] 6.10 Implement generation error and retry UI
- [ ] 6.11 Implement 90-day retention cleanup for generation attempts

## 7. Verification and Review
- [ ] 7.1 Unit-test prompt parsing and fact-fidelity guard
- [ ] 7.2 Add route tests for owner-only protected actions
- [ ] 7.3 Add route tests for public feed and post detail
- [ ] 7.4 Manually verify page flows and accessibility basics
- [ ] 7.5 If present, run `bun run lint` and `bun run check`
- [ ] 7.6 Update `DESIGN.md` or `AGENTS.md` if any implementation discovery changes stated facts
- [ ] 7.7 Archive `initial-scaffold` change into openspec once approved and complete
