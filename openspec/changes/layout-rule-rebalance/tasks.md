# Tasks: Rebalance Layout Contract for Creative Infographic Prompts

## 1. Style Lock

- [ ] 1.1 Replace narrow-column wording in `TYPOGRAPHY` with proportional usable-width wording.
- [ ] 1.2 Restore dominant focal hierarchy and add comparison anti-rival wording.
- [ ] 1.3 Clarify dominant labelled-subject scale inside containment margin.
- [ ] 1.4 Clarify structural composition framing versus prohibited decorative borders and device frames.
- [ ] 1.5 Add split-safety wording and remove redundant or conflicting layout constraints.

## 2. Visual Notes

- [ ] 2.1 Require proportional text-block width and prohibit narrow columns caused only by decorative splits.
- [ ] 2.2 Require split/divider placement that does not cut through or strand primary text.
- [ ] 2.3 Require meaningful dominant-subject scale while preserving full containment.
- [ ] 2.4 Require anti-mirroring hierarchy for comparison or paired-subject slides, with semantic symmetry exception.

## 3. Provider Prompt

- [ ] 3.1 Rebalance shared `LAYOUT_RULE` around proportional text width, split safety, dominant scale, and comparison hierarchy.
- [ ] 3.2 Reconcile `EXCLUSIONS_RULE` with structural composition framing.
- [ ] 3.3 Preserve exact text, render/context boundaries, exclusions, style lock, canvas, ratio, and stochasticity wording.
- [ ] 3.4 Remove duplicated or contradictory layout instructions across prompt seams where possible.

## 4. Tests

- [ ] 4.1 Test style-lock proportional text, split safety, dominant scale, and anti-rival wording.
- [ ] 4.2 Test visual-note proportional text width, split safety, dominant scale, and comparison anti-symmetry wording.
- [ ] 4.3 Test all provider prompts include updated layout rule and preserve existing boundaries.
- [ ] 4.4 Test structural framing remains allowed while decorative borders and device frames remain excluded.
- [ ] 4.5 Test no pixel-margin invention, provider guarantee, or new factual content.

## 5. Verification

- [ ] 5.1 `openspec validate layout-rule-rebalance`
- [ ] 5.2 `bun run test`
- [ ] 5.3 `bun run check`
- [ ] 5.4 `bun run lint`
- [ ] 5.5 Owner generates one square comparison hook and checks text width, split safety, focal hierarchy, anti-mirroring, label rhythm, and subject containment.

## Dependencies

```
1 + 2 + 3 -> 4 -> 5
```

No schema, migration, route, UI, placement, or provider integration change.
