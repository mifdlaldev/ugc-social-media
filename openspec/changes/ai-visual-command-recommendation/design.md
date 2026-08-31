# Design: AI Visual Command Recommendation

## Decision

Add one advisory stage between research approval and prompt generation. It reads the topic and the approved research brief, then proposes catalog commands with reasons. It writes nothing to the post unless the owner applies it.

Existing generation is untouched when no recommendation is requested.

## Why a separate stage

The command already flows into three places: the synthesis instruction, the style-lock instruction, and the leading token of the GPT Image prompt. Changing the command changes all three. Making recommendation a separate, owner-approved step keeps that blast radius under the owner's control instead of letting a model silently reshape every downstream prompt.

## Catalog Constraint

`src/lib/catalog/visualCommands.ts` holds 18 commands across three categories. The recommendation instruction receives the catalog inline — `value`, `label`, `description` — and is told to return only `value` strings from that list.

Validation is a hard gate, not a coercion:

```ts
if (!isVisualCommand(value)) throw new Error('RECOMMENDATION_UNKNOWN_COMMAND');
```

No `?? DEFAULT_VISUAL_COMMAND` anywhere in the parse path. A wrong value must be visible, because silently substituting `/infographic` is exactly the failure the owner already experienced.

## Response Shape

```json
{
  "primary": { "command": "/comparison", "reason": "..." },
  "alternatives": [{ "command": "/scale", "reason": "..." }],
  "per_slide": [{ "slide_index": 0, "command": "/comparison", "reason": "..." }]
}
```

`alternatives` capped at two. `per_slide` optional; absent is valid and must not throw.

## Reason Grounding

A reason explains visual form only. The instruction forbids introducing an engineering fact, number, material property, dimension, standard, duration, or claim not present in the supplied topic or research brief.

It also forbids claiming the command will improve the image, engagement, or comprehension. No reviewed source supports such a claim, and the research already recorded in `docs/educational-carousel-copy-reference.md` found one study where signalling raised engagement without raising quiz scores.

## Storage

A new table keyed by post id, storing model id, topic snapshot, primary command and reason, alternatives, per-slide plan, raw output, and timestamp. Raw output is kept for debugging, consistent with how style-lock and synthesis attempts are already treated.

Storing the recommendation means reopening the page costs nothing. The owner is not charged a second model call to re-read advice they already have.

SQLite via `@libsql/client`, hand-written migration, applied with the existing `bun -e` script. Comment lines stripped before splitting on `;`.

## UI

Below the existing `VisualCommandSelect` on the edit page:

- a button to request a recommendation, enabled once research sources exist;
- the primary command with its reason and an explicit apply action;
- alternatives, each with a reason and its own apply action;
- the per-slide plan shown read-only in this change, since generation still consumes one command.

Nothing auto-applies. The select remains the authoritative input.

## What This Change Does Not Do

- No automatic application. The owner decides.
- No catalog change. The 18 values and their verbatim descriptions stay as extracted from the owner's PDFs.
- No visual-identity or style-preset concept.
- No per-slide layout variation. The owner's design complaint about repeated composition is a distinct defect with a distinct cause and needs its own change.
- No change to slide count, teaching fields, style lock, render boundary, or placement.
- No claim that a recommended command guarantees a better image.

## Testing

- Valid response parses; primary, alternatives, and per-slide values all resolve in the catalog.
- Unknown command in any position throws; no default substitution.
- Malformed JSON, prose-wrapped JSON, and missing required fields throw stable errors.
- Absent `per_slide` parses cleanly.
- More than two alternatives is rejected or truncated per the parser contract, tested either way.
- The instruction text contains the catalog constraint, the no-new-facts rule, and the no-efficacy-claim rule.
- Generation with no recommendation produces byte-identical prompts to current behaviour.

Then `bun run check`, `bun test --run`, `bun run lint`, `openspec validate ai-visual-command-recommendation`, and the pipeline smoke test.
