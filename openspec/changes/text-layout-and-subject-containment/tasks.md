# Tasks: Consistent Text Layout and Subject Containment

## 1. Style Lock

- [x] 1.1 Update `TYPOGRAPHY` with one aligned text-block system, controlled measure, balanced line lengths, and consistent line-height/gaps.
- [x] 1.2 Update `FOCAL POINT` so edge cropping applies only to unlabelled atmosphere or decorative elements.
- [x] 1.3 Update `BACKGROUND` so text, labels, and labelled subjects stay inside breathing margin.
- [x] 1.4 Add compact text-zone, label-zone, and subject-containment art-direction rules.

## 2. Visual Notes

- [x] 2.1 Require text zone, subject zone, and label anchors.
- [x] 2.2 Require one aligned primary text block with controlled width, balanced line breaks, consistent line-height, and no accidental side void.
- [x] 2.3 Require shared label badge treatment, padding, alignment rhythm, subject proximity, and safe margin.
- [x] 2.4 Require all labelled subjects fully visible inside canvas; allow crop only for unlabelled atmosphere/decorative elements.

## 3. Provider Prompt

- [x] 3.1 Add shared `LAYOUT_RULE` to all providers.
- [x] 3.2 Preserve exact text, render/context boundaries, exclusions, style lock, canvas, and ratio.
- [x] 3.3 Clarify line-break planning does not authorize rewriting `on_image_text`.

## 4. Tests

- [x] 4.1 Test style-lock typography, safe margin, and crop-exception wording.
- [x] 4.2 Test visual-note text/subject/label-zone requirements.
- [x] 4.3 Test aligned text block, balanced line breaks, and whitespace rule.
- [x] 4.4 Test label-system consistency and containment rules.
- [x] 4.5 Test all provider prompts include layout rule and preserve existing boundaries.
- [x] 4.6 Test no pixel-margin invention, provider guarantee, or new factual content.

## 5. Verification

- [x] 5.1 `openspec validate text-layout-and-subject-containment`
- [x] 5.2 `bun run test`
- [x] 5.3 `bun run check`
- [x] 5.4 `bun run lint`
- [ ] 5.5 Owner generates one square hook and checks text alignment, right-side whitespace, label rhythm, and wall containment.

## Dependencies

```
1 + 2 + 3 -> 4 -> 5
```

No schema, migration, route, UI, placement, or provider integration change.
