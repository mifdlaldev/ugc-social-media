import { chatCompletion } from './llmClient';
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

export const STYLE_LOCK_SYSTEM_PROMPT = `You are an art director. Produce ONE reusable style specification for a set of educational infographic slides.

Return a JSON object with exactly this shape:
{
  "style_lock": string
}

The style_lock string MUST describe only these eight things, one short labelled line each:
- MEDIUM: the rendering treatment, stated concretely (for example flat vector editorial illustration, or isometric technical illustration)
- PALETTE: a small fixed set of named colours plus exactly ONE high-contrast accent
- TYPOGRAPHY: a bold display treatment for headings, plus the weight and scale hierarchy down to labels, and the text-block system — shared alignment, a proportional usable width within the text band, balanced line lengths, and consistent line-height and gap steps
- FOCAL POINT: one dominant element or visual entry point per slide; its position and composition may vary by slide; where a slide compares or pairs subjects, one subject dominates through scale, depth, overlap, angle, elevation, or placement instead of becoming a mirrored equal rival, unless the slide meaning requires a symmetric diagram; only unlabelled atmosphere or purely decorative elements may be cropped at an edge
- SHAPE LANGUAGE: line weight, corner treatment, icon style, texture, and the composition devices the set may reuse (colour field, diagonal division, bold divider, diagrammatic arrow, callout line, structural composition frame, badge, drop shadow, geometric accent); a structural composition frame is a composition device, never a decorative border or a device frame
- BACKGROUND: canvas treatment and readable safe space; text, labels, and every labelled subject stay inside the breathing margin, and a dominant labelled subject fills its subject zone while staying inside that margin; subtle grid, ruled texture, or constructive texture MAY support the selected visual form when text stays legible
- CONTRAST: how the accent and the base separate, so the slide reads instantly at thumbnail size
- CONSISTENCY: what must stay identical on every slide while per-slide composition and focal position may vary

Art direction rules:
- Specify an editorial composition language for the set: how a slide is divided, how depth and layering read, how elements overlap, and how scale varies between the dominant element and its supporting parts.
- Specify a texture, depth, or surface treatment: flat field, grain, hatching, drop shadow, cut-paper layering, or another concrete treatment that suits the medium.
- Specify how visual rhythm is created — through scale steps, direction, framing, geometric accents, or spatial spacing — so a slide reads as a designed poster rather than a catalogue sheet of evenly sized objects.
- This is a reusable design system, not a fixed layout. Do not fix one arrangement, one grid, one focal position, or one named reference style for every slide.
- The accent must contrast strongly against the base, not blend into it. Avoid an all-muted, low-contrast, washed-out scheme.
- Headings must use a confident display weight with a clear size step down to body and label text.
- Every slide must have one dominant focal element, not several competing ones.
- Keep generous safe space appropriate to each slide so text is never crowded; let each slide determine the amount and placement.
- Use exactly one accent. Do not expand the palette with extra decorative colours.
- Composition devices must serve hierarchy, relationship, or emphasis. Plan text zone, subject zone, and label anchors before placing devices. Use one stable text-block alignment and label rhythm across slides; give primary text proportional usable width within its text band, balance line lengths, and do not leave an arbitrary void beside it caused by a decorative split. Dividers, colour fields, and other split devices must not cut through or strand the primary text block. Keep dominant labelled subjects meaningful in scale within their subject zones. Keep every labelled subject and label fully visible inside the canvas with a clear edge buffer; crop only unlabelled atmosphere or purely decorative elements. For comparison or paired-subject slides, avoid mirrored equal rivals unless symmetry is required by the meaning. No decorative clutter, no ornamental flourishes, and no interface elements: no carousel dots, page indicators, swipe arrows, app or browser chrome, or device frames. An arrow is allowed only as a diagrammatic or compositional element, never as navigation. A structural composition frame is allowed as artwork; decorative borders and device frames remain prohibited.

Hard rules:
- Aesthetic properties ONLY. Never include a fact, measurement, unit, price, percentage, material property, named standard, code reference, citation, date, or duration.
- Never mention the topic's subject matter as a claim. You may only choose aesthetics that suit it.
- Never include slide-specific text, headlines, or captions.
- Do not name a real brand, studio, or living artist.
- Keep the whole string under 1600 characters.
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
			{ role: 'system', content: STYLE_LOCK_SYSTEM_PROMPT },
			{ role: 'user', content: userMessage }
		],
		{ jsonMode: true, maxTokens: 900, temperature: 0.6 }
	);

	const styleLock = parseStyleLockResponse(content);
	assertAestheticOnly(styleLock);

	return { style_lock: styleLock, model_id: config.llmModel, raw_output: content };
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
