# Owner Content Direction Reference

> Owner requirements captured on 2026-08-30 from a real test of the first post
> ("Kegunaan Kolom Bangunan", 5 slides, `/infographic`, Instagram Feed Square).
> This file records **what the owner asked for** and **what was observed in the
> generated output**. It is not a source of engineering facts.

## What the owner asked for

1. **Every slide needs a headline plus a short explanation.** A single large
   headline is not enough. The explanation must be brief but informative.
2. **Teach, do not shout.** The desired voice is a lecturer explaining material to
   students, not a warning poster.
3. **Hook should invite, then explain.** Owner's own example of the desired shape:
   "Kalian sudah tau atau belum, bahwa kolom itu jantungnya bangunan?" followed by
   a short description.
4. **Problem, solution, and CTA slides must have a clear direction too.** In the
   test they felt stiff and it was unclear where they were leading.
5. **Reference material supplied by the owner is a single unstructured slide.** The
   requirement is to keep that manner of delivery but apply it to the structured
   carousel this app produces: hook → standalone context → problem → data →
   solution → summary → CTA.
6. **The narrative pattern is shared across every visual command.** Only the
   leading command token and the visual style differ per command; the
   headline-plus-explanation structure stays the same for all of them.

## What was observed in the generated output

Recorded from `~/Documents/PROMPT SAMPLE 1.txt` and the five returned images.

| Observation                      | Detail                                                                                                                                                                                 |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No field carries an explanation  | `SYSTEM_PROMPT` in `promptGenerator.ts` caps `on_image_text` at 80 characters and requires "a key phrase, NOT a full sentence". The model is therefore never given room for body copy. |
| Invented number in a hook        | Slide 1 title read "Tanpa Kolom, Gedung Runtuh dalam 3 Detik". "3 Detik" cannot come from research and is a fact-fidelity failure.                                                     |
| Invented statistic               | Slide 4 read "95% Bangunan Pakai Kolom Terikat". The 95% figure is unverified.                                                                                                         |
| Inconsistent direction language  | Slide 3 `Visual direction` was written in Indonesian while the other four were in English.                                                                                             |
| Style lock collapsed to one line | The six labelled lines were emitted as a single long paragraph, reducing readability for the model.                                                                                    |
| Alarmist framing                 | Red warning tones, debris, and exclamation icons dominated instead of explanatory diagrams with labels.                                                                                |

## Boundaries that still apply

- Facts, numbers, materials, dimensions, named methods, and standards may come
  only from approved You.com research and the owner's topic.
- The owner's reference images are a guide to **delivery format only**, never a
  source of technical claims.
- No engagement, reach, or algorithm outcome may be promised.
- The app produces prompts only; images are generated in external tools.
