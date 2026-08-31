import { chatCompletion } from './llmClient';
import { config } from './config';
import { VISUAL_COMMANDS, isVisualCommand } from '$lib/catalog/visualCommands';

export interface CommandSuggestion {
	command: string;
	reason: string;
}

export interface PerSlideSuggestion {
	slide_index: number;
	command: string;
	reason: string;
}

export interface RecommendationResult {
	primary: CommandSuggestion;
	alternatives: CommandSuggestion[];
	per_slide: PerSlideSuggestion[] | null;
	model_id: string;
	raw_output: string;
}

/** At most two alternatives, so the owner is offered a choice rather than a list. */
export const MAX_ALTERNATIVES = 2;
export const MAX_REASON_LENGTH = 240;

/**
 * The catalog is passed inline so the model chooses from the owner's approved
 * commands and their verbatim descriptions, never from its own vocabulary.
 */
function catalogBlock(): string {
	return VISUAL_COMMANDS.map((c) => `${c.value} — ${c.label} — ${c.description}`).join('\n');
}

export const RECOMMENDATION_SYSTEM_PROMPT = `You recommend a visual form for one educational carousel about civil engineering, construction, or architecture.

You will receive a topic and an approved research brief. You must choose from the catalog supplied in the user message. That catalog is the only permitted source of command values.

Return a JSON object with exactly this shape:
{
  "primary": { "command": string, "reason": string },
  "alternatives": [ { "command": string, "reason": string } ],
  "per_slide": [ { "slide_index": number, "command": string, "reason": string } ]
}

Rules:
- Every "command" MUST be copied exactly from the supplied catalog, including the leading slash
- Never invent a command, rename one, or return a value absent from the catalog
- "alternatives" holds at most ${MAX_ALTERNATIVES} entries; return an empty array when no second choice is genuinely better
- "per_slide" is optional; omit it entirely when one form suits the whole carousel
- Choose the form whose catalog description matches the shape of the supplied content. A topic that sets two named subjects against each other suits a side-by-side form. A topic with several independent points or figures suits an information-layout form. A topic that depends on internal parts, slices, or stacked layers suits the corresponding structural form
- Each "reason" must be one short sentence (max ${MAX_REASON_LENGTH} characters) explaining the visual fit, citing only the supplied topic or research brief
- A reason must NOT introduce an engineering fact, number, percentage, material property, dimension, standard, code reference, duration, or price
- A reason must NOT claim the form produces a better image, more engagement, better comprehension, or that any image tool will comply
- Write reasons in Indonesian
- Return ONLY the JSON object, no markdown fence`;

/**
 * Produces advisory command advice for a post.
 *
 * The caller stores the result; it never writes `posts.visual_command`. The owner
 * decides whether to apply it.
 */
export async function recommendVisualCommand(
	topic: string,
	researchBrief: string,
	slideCount: number
): Promise<RecommendationResult> {
	if (topic.trim().length === 0) throw new Error('RECOMMENDATION_TOPIC_REQUIRED');
	if (researchBrief.trim().length === 0) throw new Error('RECOMMENDATION_RESEARCH_REQUIRED');

	const userMessage = `TOPIC: ${topic}
SLIDE_COUNT: ${slideCount} (slide_index uses 0-based numbering: 0, 1, …, ${slideCount - 1})

CATALOG (the only permitted command values):
${catalogBlock()}

RESEARCH BRIEF (read to judge which visual form fits the content; do NOT copy any fact into a reason):
${researchBrief.slice(0, 4000)}

Recommend the visual form. Output valid JSON only.`;

	const content = await chatCompletion(
		[
			{ role: 'system', content: RECOMMENDATION_SYSTEM_PROMPT },
			{ role: 'user', content: userMessage }
		],
		{ jsonMode: true, maxTokens: 1200, temperature: 0.4 }
	);

	const parsed = parseRecommendationResponse(content, slideCount);
	return { ...parsed, model_id: config.llmModel, raw_output: content };
}

/**
 * Parses the model response defensively.
 *
 * A command outside the catalog throws. There is deliberately no fallback to
 * DEFAULT_VISUAL_COMMAND: a silent substitution is what left the owner with an
 * unsuitable form in the first place, so a wrong value must be visible.
 */
export function parseRecommendationResponse(
	content: string,
	slideCount: number
): Pick<RecommendationResult, 'primary' | 'alternatives' | 'per_slide'> {
	const json = extractJson(content);
	let data: {
		primary?: unknown;
		alternatives?: unknown;
		per_slide?: unknown;
	};
	try {
		data = JSON.parse(json) as typeof data;
	} catch {
		throw new Error('RECOMMENDATION_INVALID_JSON');
	}

	const primary = readSuggestion(data.primary, 'RECOMMENDATION_MISSING_PRIMARY');

	const alternatives: CommandSuggestion[] = [];
	if (data.alternatives !== undefined && data.alternatives !== null) {
		if (!Array.isArray(data.alternatives)) throw new Error('RECOMMENDATION_INVALID_ALTERNATIVES');
		if (data.alternatives.length > MAX_ALTERNATIVES) {
			throw new Error('RECOMMENDATION_TOO_MANY_ALTERNATIVES');
		}
		for (const entry of data.alternatives) {
			alternatives.push(readSuggestion(entry, 'RECOMMENDATION_INVALID_ALTERNATIVES'));
		}
	}

	let perSlide: PerSlideSuggestion[] | null = null;
	if (data.per_slide !== undefined && data.per_slide !== null) {
		if (!Array.isArray(data.per_slide)) throw new Error('RECOMMENDATION_INVALID_PER_SLIDE');
		const entries: PerSlideSuggestion[] = [];
		for (const raw of data.per_slide) {
			const suggestion = readSuggestion(raw, 'RECOMMENDATION_INVALID_PER_SLIDE');
			const index = (raw as { slide_index?: unknown }).slide_index;
			if (typeof index !== 'number' || !Number.isInteger(index)) {
				throw new Error('RECOMMENDATION_INVALID_PER_SLIDE');
			}
			if (index < 0 || index >= slideCount) {
				throw new Error('RECOMMENDATION_SLIDE_INDEX_OUT_OF_RANGE');
			}
			entries.push({ slide_index: index, command: suggestion.command, reason: suggestion.reason });
		}
		perSlide = entries.length > 0 ? entries : null;
	}

	return { primary, alternatives, per_slide: perSlide };
}

function readSuggestion(value: unknown, errorCode: string): CommandSuggestion {
	if (typeof value !== 'object' || value === null) throw new Error(errorCode);
	const { command, reason } = value as { command?: unknown; reason?: unknown };
	if (typeof command !== 'string' || command.trim().length === 0) throw new Error(errorCode);
	if (!isVisualCommand(command)) throw new Error('RECOMMENDATION_UNKNOWN_COMMAND');
	if (typeof reason !== 'string' || reason.trim().length === 0) {
		throw new Error('RECOMMENDATION_MISSING_REASON');
	}
	return { command, reason: reason.trim().slice(0, MAX_REASON_LENGTH) };
}

function extractJson(content: string): string {
	const trimmed = content.trim();
	if (trimmed.startsWith('{') && trimmed.endsWith('}')) return trimmed;
	const match = trimmed.match(/\{[\s\S]*\}/);
	if (!match) throw new Error('RECOMMENDATION_NO_JSON');
	return match[0];
}
