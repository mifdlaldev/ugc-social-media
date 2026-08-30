# Carousel Structure Research Reference

> Research performed with You.com on 2026-08-30. **Almost every figure below comes from
> third-party marketing blogs and tool vendors, not from Meta.** Numbers disagree between
> sources. Treat them as directional evidence for product decisions, never as verified fact,
> and never copy them into generated prompt content as claims.

## Source status

| Claim                                                                                                    | Status                                                                                                     |
| -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Instagram re-serves a carousel starting from the second slide when a viewer scrolls past without swiping | Attributed to a public statement by Adam Mosseri, quoted by third-party sources. Strongest evidence found. |
| Slide 1 carries most of a carousel's outcome                                                             | Third-party assertion, repeated across sources with no shared measurement method.                          |
| Optimal slide count                                                                                      | **Sources conflict:** 5–8, 7–10, and 8–12 all appear. No official Meta figure was found.                   |
| Engagement, save, swipe-through, and completion benchmarks                                               | Third-party benchmark tables. Different sources give different ranges for the same metric.                 |
| Mid-carousel soft CTA increases saves by 31%                                                             | Single third-party claim, no methodology given. Not verified.                                              |
| Swipe cue or progress indicator increases swipe-through by 15–30%                                        | Third-party claims attributed to a vendor study. Not independently verified.                               |
| Education-category carousels show the highest engagement range                                           | Third-party benchmark table. Relevant to this project's domain but unverified.                             |

## Findings the project acts on

1. **Hook → value → CTA is the consensus structure.** Every source describes the same three roles: an opening slide that earns the swipe, middle slides delivering one idea each, and a closing slide asking for one action.
2. **The second slide must stand alone.** Because of the re-serve behavior, a viewer may encounter slide 2 first. A slide 2 written as a grammatical continuation of slide 1 fails in that case.
3. **One idea per value slide.** A value slide should make sense on its own, without the previous slide's context.
4. **One action per CTA slide.** Asking for save, follow, and comment simultaneously is described as a failure mode.
5. **A mid-carousel soft CTA is recommended** because many viewers never reach the final slide. The specific uplift figure is not trustworthy; the reasoning is.
6. **Deliberate progress text differs from unrequested interface decoration.** Sources recommend an explicit `1/8`-style indicator. This is distinct from the fake carousel dots, swipe arrows, and app chrome that image models add unprompted, which remain excluded.
7. **Visual consistency across slides is repeatedly cited** as a driver of completion, which is consistent with the separately specified per-post style lock.

## Findings the project does not act on

- Specific numeric benchmarks are not encoded anywhere in the product, because sources conflict.
- Video or mixed-media slides are out of scope; this application produces image prompts only.
- Comment-to-DM automation, hashtag strategy, caption authoring, and posting-time optimisation are out of scope.
- No engineering fact, statistic, or benchmark from these sources may enter generated prompt content. Facts continue to come only from approved research and the owner's topic.
