# Tasks: AI Visual Command Recommendation

## 1. Storage

- [ ] 1.1 Add a `visual_command_recommendations` table keyed by post id, storing model id, topic snapshot, primary command, primary reason, alternatives, per-slide plan, raw output, and created timestamp.
- [ ] 1.2 Write the migration by hand under `drizzle/migrations/`, following the existing numbering.
- [ ] 1.3 Apply it locally with the existing `bun -e` libsql script, stripping `--` comment lines before splitting on `;`.
- [ ] 1.4 Confirm existing rows in `posts`, `prompt_slides`, and `provider_variants` are still readable and no foreign key is violated.

## 2. Recommendation Service

- [ ] 2.1 Create `src/lib/server/visualCommandRecommendation.ts` with an exported system prompt and an exported parser.
- [ ] 2.2 Pass the catalog inline into the instruction as `value`, `label`, and `description` from `src/lib/catalog/visualCommands.ts`.
- [ ] 2.3 Require a JSON object with `primary`, `alternatives` (max two), and optional `per_slide`.
- [ ] 2.4 Validate every command value with `isVisualCommand`; throw `RECOMMENDATION_UNKNOWN_COMMAND` on failure with no default substitution.
- [ ] 2.5 Throw stable errors for malformed JSON, absent JSON, and missing required fields.
- [ ] 2.6 Accept an absent `per_slide` without error.
- [ ] 2.7 State in the instruction that a reason may only cite the supplied topic or research brief and must not add an engineering fact, number, material property, dimension, standard, duration, or claim.
- [ ] 2.8 State in the instruction that a reason must not claim better images, higher engagement, higher comprehension, or provider compliance.

## 3. API and Persistence

- [ ] 3.1 Add `POST /api/posts/:id/visual-command-recommendation` to generate and persist a recommendation.
- [ ] 3.2 Add `GET /api/posts/:id/visual-command-recommendation` to read the stored recommendation.
- [ ] 3.3 Gate generation on the existence of approved research sources, matching the existing style-lock gate pattern.
- [ ] 3.4 Return the stored recommendation without a model call when one already exists, unless regeneration is explicitly requested.
- [ ] 3.5 Confirm no route mutates `posts.visual_command` as a side effect of requesting a recommendation.

## 4. UI

- [ ] 4.1 Add a recommendation panel below `VisualCommandSelect` on `/owner/edit/[id]`.
- [ ] 4.2 Show the primary command with its reason and an explicit apply action.
- [ ] 4.3 Show up to two alternatives, each with its reason and its own apply action.
- [ ] 4.4 Show the per-slide plan read-only, labelled as reference since generation uses one command.
- [ ] 4.5 Use the local-state-plus-derived pattern so the panel reflects an applied change before the server load refreshes.
- [ ] 4.6 Confirm the select remains the authoritative input and nothing auto-applies.

## 5. Verification

- [ ] 5.1 Test that a valid response parses and all values resolve in the catalog.
- [ ] 5.2 Test that an unknown command in primary, alternatives, or per-slide throws and is not replaced by a default.
- [ ] 5.3 Test malformed JSON, prose-wrapped JSON, and missing required fields throw stable errors.
- [ ] 5.4 Test that an absent `per_slide` parses cleanly.
- [ ] 5.5 Test the alternatives cap behaviour explicitly.
- [ ] 5.6 Test that the instruction contains the catalog constraint, the no-new-facts rule, and the no-efficacy-claim rule.
- [ ] 5.7 Test that generation with no recommendation produces prompts identical to current behaviour.
- [ ] 5.8 `bun run check`, `bun test --run`, and `bun run lint` pass.
- [ ] 5.9 `openspec validate ai-visual-command-recommendation` passes.
- [ ] 5.10 Extend the pipeline smoke test with a recommendation step and confirm it does not mutate the stored command.
- [ ] 5.11 Owner review: enter "Bata merah vs bata ringan" and confirm the recommendation proposes a comparison-shaped command with a grounded reason.

## Dependencies

```
1 (storage) -> 3 (API)
2 (service) -> 3
3           -> 4 (UI)
1,2,3,4     -> 5 (verification)
```

Independent of the per-slide layout-variation defect, which needs its own change.
