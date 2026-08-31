import { chatCompletion } from './llmClient';
import { findVisualCommand } from '$lib/catalog/visualCommands';
import { findPlatformPlacement } from '$lib/catalog/platformPlacements';

export type SlideType = 'hook' | 'problem' | 'data' | 'solution' | 'cta' | 'custom';

export interface SlideBrief {
	slide_index: number;
	slide_type: SlideType;
	/** Short headline or question, understandable on its own. */
	slide_title: string;
	/** Optional one-line scope, condition, or consequence. */
	slide_subtitle: string;
	/** Short teaching explanation grounded in the approved research. */
	slide_explanation: string;
	/** Delimited labels for the components, arrows, units, or stages shown. */
	visual_labels: string;
	/** One concise transferable point. */
	slide_takeaway: string;
	research_context: string;
}

export interface SynthesisResult {
	topic: string;
	platform_placement: string;
	visual_command: string;
	slides: SlideBrief[];
}

export const SYNTHESIS_SYSTEM_PROMPT = `You are a practitioner in civil engineering, construction, and architecture who teaches on social media. Given a topic and research sources, produce a structured teaching brief for a carousel of N slides.

The output MUST be a JSON object with this exact schema:
{
  "topic": string,
  "slides": [
    {
      "slide_index": number (0-based, starting at 0),
      "slide_type": "hook" | "problem" | "data" | "solution" | "cta" | "custom",
      "slide_title": string (short headline or question, max 70 chars),
      "slide_subtitle": string (one short line of scope, condition, or consequence; empty string if not needed),
      "slide_explanation": string (1-3 short sentences that teach this slide's point, max 240 chars),
      "visual_labels": string (labels for the parts, arrows, units, or stages shown, separated by " | "; empty string if none),
      "slide_takeaway": string (one concise transferable point, max 120 chars),
      "research_context": string (the supporting facts from the sources, max 300 chars)
    }
  ]
}

STRUCTURE
- slide_index 0 MUST be "hook"
- Last slide MUST be "cta"
- Middle slides distribute across "problem", "data", "solution", "custom"
- One teaching point per slide
- Introduce a technical term before the slide whose mechanism depends on it

FACT FIDELITY
- Every factual statement must come from the supplied research sources or the topic
- Preserve a source's qualifier exactly. If a source says "hampir 95%", write "hampir 95%". Never turn an approximate figure into an exact one
- Carry a source's condition or scope alongside its figure when the source states one
- If a claim is not in the sources, OMIT it. Never complete it from your own knowledge
- Never invent numbers, percentages, durations, prices, dimensions, standards, code references, project names, citations, handles, or links

VOICE
- Write as a practitioner who teaches, not as a report. Explain to one learner, in plain language, while staying technically precise
- Address the reader as "kamu". Do not default to formal institutional register
- The hook must open from a practical question or a situation the learner already recognises, then name the mechanism the carousel actually explains
- A problem slide must connect its problem to the mechanism or evidence taught next
- A solution slide must state only the supported implication; never turn an example into a universal rule
- A cta slide must close the lesson in its explanation and request exactly one action
- Vary sentence length where emphasis calls for it. Do not make every sentence the same length, and do not alternate mechanically
- Define a technical term in ordinary words the first time it appears
- Attribute a figure only when you name the specific source and claim. Do not write filler attribution such as "Sumber menjelaskan bahwa", "Sumber menyarankan agar", "studi menunjukkan", or "para ahli sepakat"
- Use natural Indonesian connectors that fit the sentence, for example "karena", "soalnya", "jadi", "tapi", "padahal", "misalnya", "biasanya". Do not open every transition with "selain itu" or "dengan demikian"
- Do not use literal translated-English phrasing such as "di penghujung hari" or "mari kita breakdown"

PATTERNS TO AVOID
- Filler attribution as a sentence opener, as listed above
- Textbook framing such as "Anda akan mempelajari"
- Making every slide_title a question. Use a question only where the content genuinely asks one
- Repeating the "bukan sekadar X, tetapi Y" construction across slides
- Three-word staccato lists such as "Pelajari. Bandingkan. Putuskan"
- Overly formal calls to action. Ask for the one action plainly
- Excessive em dashes
- FORBIDDEN: unsupported fear language, sensationalism, clickbait, superlatives, and absolutes such as "selalu", "tidak pernah", "pasti runtuh", "terbaik", "paling"

HONESTY
- Never claim first-person experience, a site visit, a project, or a personal observation. None was supplied to you
- When an example helps, use a case from the supplied sources or a clearly hypothetical situation
- Fact fidelity outranks voice. A more natural sentence must never drop a source's qualifier, blur its condition, or add a claim the sources do not support

LANGUAGE
- Write every field in Indonesian

Return ONLY the JSON object, no markdown fence.`;

export async function synthesizeBriefs(
	topic: string,
	researchBrief: string,
	platformPlacement: string,
	visualCommand: string,
	slideCount: number
): Promise<SynthesisResult> {
	const command = findVisualCommand(visualCommand);
	const placement = findPlatformPlacement(platformPlacement);

	/**
	 * Both lines below describe FORM only. The catalog description states the
	 * visual form; the placement states the target canvas. Neither may introduce
	 * a factual claim: those come solely from the research sources.
	 */
	const commandLine = command ? `${command.value} — ${command.description}` : visualCommand;
	const placementLine = placement
		? `${placement.platform} ${placement.placement} — target canvas ${placement.width}x${placement.height} px, ratio ${placement.ratio}`
		: platformPlacement;

	const userMessage = `TOPIC: ${topic}
TARGET PLACEMENT: ${placementLine}
VISUAL FORM: ${commandLine}
SLIDE_COUNT: ${slideCount}

RESEARCH SOURCES:
${researchBrief}

Produce a brief for ${slideCount} slides. Output valid JSON only.`;

	const content = await chatCompletion(
		[
			{ role: 'system', content: SYNTHESIS_SYSTEM_PROMPT },
			{ role: 'user', content: userMessage }
		],
		{ jsonMode: true, maxTokens: 3000, temperature: 0.6 }
	);

	const parsed = parseSynthesisResponse(content, slideCount);
	return {
		topic,
		platform_placement: platformPlacement,
		visual_command: visualCommand,
		slides: parsed
	};
}

export function parseSynthesisResponse(content: string, expectedCount: number): SlideBrief[] {
	const json = extractJson(content);
	const data = JSON.parse(json) as { slides?: SlideBrief[] };
	if (!data.slides || !Array.isArray(data.slides)) {
		throw new Error('SYNTHESIS_INVALID_FORMAT');
	}

	const slides = data.slides.slice(0, expectedCount);

	for (let i = 0; i < slides.length; i++) {
		const s = slides[i] as Partial<SlideBrief>;
		if (typeof s.slide_index !== 'number') s.slide_index = i;
		if (i === 0) s.slide_type = 'hook';
		if (i === slides.length - 1) s.slide_type = 'cta';
		if (!s.slide_type) s.slide_type = 'custom';

		/**
		 * A headline and an explanation are the point of this stage. Failing loudly
		 * is better than emitting a slide with nothing that teaches anything, which
		 * is the defect this contract exists to fix.
		 */
		if (typeof s.slide_title !== 'string' || s.slide_title.trim().length === 0) {
			throw new Error('SYNTHESIS_MISSING_TITLE');
		}
		if (typeof s.slide_explanation !== 'string' || s.slide_explanation.trim().length === 0) {
			throw new Error('SYNTHESIS_MISSING_EXPLANATION');
		}

		// Optional fields default to empty rather than inventing content.
		if (typeof s.slide_subtitle !== 'string') s.slide_subtitle = '';
		if (typeof s.visual_labels !== 'string') s.visual_labels = '';
		if (typeof s.slide_takeaway !== 'string') s.slide_takeaway = '';
		if (typeof s.research_context !== 'string') s.research_context = '';
	}

	return slides as SlideBrief[];
}

function extractJson(content: string): string {
	const trimmed = content.trim();
	if (trimmed.startsWith('{') && trimmed.endsWith('}')) return trimmed;
	const match = trimmed.match(/\{[\s\S]*\}/);
	if (!match) throw new Error('SYNTHESIS_NO_JSON');
	return match[0];
}
