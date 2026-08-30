import { chatCompletion } from './openRouterClient';
import { config } from './config';
import { findPlatformPlacement } from '$lib/catalog/platformPlacements';
import { findVisualCommand } from '$lib/catalog/visualCommands';

/** Bounds for owner-edited style-lock text. */
export const STYLE_LOCK_MAX_LENGTH = 2000;
export const STYLE_LOCK_MIN_LENGTH = 40;

/**
 * Terms that would turn an aesthetic specification into a factual claim.
 * A style lock decides how a slide looks, never what it asserts, so a unit or a
 * standards reference appearing here means the model drifted out of scope.
 */
const FACTUAL_TERM_PATTERNS: RegExp[] = [
	/\b\d+\s?(mm|cm|m|m2|m3|km|kg|ton|mpa|kn|psi|%)\b/i,
	/\b(sni|astm|aci|iso|en)\s?\d+/i,
	/\bRp\s?\d/i,
	/\b\d+\s?(hari|minggu|bulan|tahun)\b/i
];

const SYSTEM_PROMPT = `You are an art director. Produce ONE reusable style specification for a set of educational infographic slides.

Return a JSON object with exactly this shape:
{
  "style_lock": string
}

The style_lock string MUST describe only these six things, one short labelled line each:
- MEDIUM: the rendering treatment, stated concretely (for example flat vector editorial illustration, or isometric technical illustration)
- PALETTE: a small fixed set of named colours plus one accent
- TYPOGRAPHY: font character, weight contrast, and heading/label hierarchy
- SHAPE LANGUAGE: line weight, corner treatment, icon style, texture
- BACKGROUND: canvas treatment and how much negative space
- CONSISTENCY: what must stay identical on every slide

Hard rules:
- Aesthetic properties ONLY. Never include a fact, measurement, unit, price, percentage, material property, named standard, code reference, citation, date, or duration.
- Never mention the topic's subject matter as a claim. You may only choose aesthetics that suit it.
- Never include slide-specific text, headlines, or captions.
- Do not name a real brand, studio, or living artist.
- Keep the whole string under 1200 characters.
- Write labels in English; the specification is a production instruction, not audience-facing copy.
- Return ONLY the JSON object, no markdown fence.`;

export interface StyleLockResult {
	style_lock: string;
	model_id: string;
	raw_output: string;
}

/**
 * Generates one aesthetic-only style specification for a post.
 *
 * Research and topic are supplied as context for choosing aesthetics that suit the
 * subject. They must not be echoed as factual claims; `assertAestheticOnly` rejects
 * output that carries units, standards, prices, or durations.
 */
export async function generateStyleLock(
	topic: string,
	researchBrief: string,
	platformPlacement: string,
	visualCommand: string
): Promise<StyleLockResult> {
	const placement = findPlatformPlacement(platformPlacement);
	const command = findVisualCommand(visualCommand);
	if (!placement) throw new Error('INVALID_PLATFORM_PLACEMENT');
	if (!command) throw new Error('INVALID_VISUAL_COMMAND');

	const userMessage = `TOPIC (for aesthetic fit only, not to be repeated as fact): ${topic}
VISUAL FORM: ${command.value} — ${command.description}
TARGET CANVAS: ${placement.width}x${placement.height} px, ratio ${placement.ratio}

RESEARCH CONTEXT (read only to judge tone and subject matter; do NOT copy any fact, number, or claim into the style specification):
${researchBrief.slice(0, 4000)}

Produce the style specification. Output valid JSON only.`;

	const content = await chatCompletion(
		[
			{ role: 'system', content: SYSTEM_PROMPT },
			{ role: 'user', content: userMessage }
		],
		{ jsonMode: true, maxTokens: 900, temperature: 0.6 }
	);

	const styleLock = parseStyleLockResponse(content);
	assertAestheticOnly(styleLock);

	return { style_lock: styleLock, model_id: config.openRouterModel, raw_output: content };
}

/** Parses the model response defensively; never returns empty text. */
export function parseStyleLockResponse(content: string): string {
	const json = extractJson(content);
	let data: { style_lock?: unknown };
	try {
		data = JSON.parse(json) as { style_lock?: unknown };
	} catch {
		throw new Error('STYLE_LOCK_INVALID_JSON');
	}
	const value = data.style_lock;
	if (typeof value !== 'string' || value.trim().length === 0) {
		throw new Error('STYLE_LOCK_EMPTY');
	}
	const text = value.trim();
	if (text.length > STYLE_LOCK_MAX_LENGTH) {
		throw new Error('STYLE_LOCK_TOO_LONG');
	}
	return text;
}

/**
 * Validates owner-edited text. The owner's wording is authoritative, so this only
 * enforces bounds — it does not rewrite or reconcile the text.
 */
export function validateStyleLockText(text: string): string {
	const trimmed = text.trim();
	if (trimmed.length === 0) throw new Error('STYLE_LOCK_EMPTY');
	if (trimmed.length < STYLE_LOCK_MIN_LENGTH) throw new Error('STYLE_LOCK_TOO_SHORT');
	if (trimmed.length > STYLE_LOCK_MAX_LENGTH) throw new Error('STYLE_LOCK_TOO_LONG');
	return trimmed;
}

/**
 * Reports factual terms found in a style lock. Used to reject generated output that
 * drifted into claims. Applied to generated text only; owner-edited text is theirs.
 */
export function findFactualTerms(text: string): string[] {
	const found: string[] = [];
	for (const pattern of FACTUAL_TERM_PATTERNS) {
		const match = text.match(pattern);
		if (match?.[0]) found.push(match[0]);
	}
	return found;
}

export function assertAestheticOnly(text: string): void {
	const found = findFactualTerms(text);
	if (found.length > 0) {
		throw new Error(`STYLE_LOCK_CONTAINS_FACTS: ${found.join(', ')}`);
	}
}

function extractJson(content: string): string {
	const trimmed = content.trim();
	if (trimmed.startsWith('{') && trimmed.endsWith('}')) return trimmed;
	const match = trimmed.match(/\{[\s\S]*\}/);
	if (!match) throw new Error('STYLE_LOCK_NO_JSON');
	return match[0];
}
