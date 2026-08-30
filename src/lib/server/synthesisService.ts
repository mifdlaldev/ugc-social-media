import { chatCompletion } from './openRouterClient';
import { findVisualCommand } from '$lib/catalog/visualCommands';
import { findPlatformPlacement } from '$lib/catalog/platformPlacements';

export type SlideType = 'hook' | 'problem' | 'data' | 'solution' | 'cta' | 'custom';

export interface SlideBrief {
	slide_index: number;
	slide_type: SlideType;
	slide_title: string;
	research_context: string;
}

export interface SynthesisResult {
	topic: string;
	platform_placement: string;
	visual_command: string;
	slides: SlideBrief[];
}

const SYNTHESIS_SYSTEM_PROMPT = `You are a social media content strategist. Given a topic and research sources, produce a structured brief for a carousel of N slides.

The output MUST be a JSON object with this exact schema:
{
  "topic": string,
  "slides": [
    {
      "slide_index": number (0-based, starting at 0),
      "slide_type": "hook" | "problem" | "data" | "solution" | "cta" | "custom",
      "slide_title": string (short, max 60 chars),
      "research_context": string (factual data from sources, max 300 chars)
    }
  ]
}

Rules:
- slide_index 0 MUST be "hook"
- Last slide_index MUST be "cta"
- Middle slides distribute across "problem", "data", "solution", "custom"
- All factual claims in research_context MUST come directly from the provided research sources
- DO NOT invent numbers, prices, or facts that are not in the sources
- Each research_context should be self-contained so a downstream image-prompt generator can use it independently
- slide_title should be evocative but factual
- language: Indonesian`;

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

function parseSynthesisResponse(content: string, expectedCount: number): SlideBrief[] {
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
		if (typeof s.slide_title !== 'string') s.slide_title = `Slide ${i + 1}`;
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
