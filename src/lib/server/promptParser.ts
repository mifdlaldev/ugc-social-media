import { REQUIRED_BLOCK_KEYS, SCHEMA_VERSION, type PromptGenerationResult } from './promptSchema';

export type ParseResult =
	{ ok: true; result: PromptGenerationResult } | { ok: false; error: string };

/**
 * Defensive JSON extraction.
 * Accepts: raw JSON, JSON wrapped in ```...``` fences, or JSON embedded in prose.
 * Returns the first syntactically valid JSON object found.
 */
export function parsePromptOutput(raw: string): ParseResult {
	const text = (raw ?? '').trim();
	if (!text) return { ok: false, error: 'Empty model output' };

	const candidate = extractFirstJsonObject(text);
	if (!candidate) return { ok: false, error: 'No JSON object found in model output' };

	let parsed: unknown;
	try {
		parsed = JSON.parse(candidate);
	} catch (err) {
		return {
			ok: false,
			error: `JSON parse failed: ${err instanceof Error ? err.message : 'invalid'}`
		};
	}

	const validation = validateResult(parsed);
	if (!validation.ok) return validation;
	return { ok: true, result: parsed as PromptGenerationResult };
}

function extractFirstJsonObject(text: string): string | null {
	// Quick path: starts with '{'
	const start = text.indexOf('{');
	if (start === -1) return null;

	let depth = 0;
	let inString = false;
	let escaped = false;
	for (let i = start; i < text.length; i++) {
		const c = text[i];
		if (inString) {
			if (escaped) escaped = false;
			else if (c === '\\') escaped = true;
			else if (c === '"') inString = false;
			continue;
		}
		if (c === '"') {
			inString = true;
		} else if (c === '{') {
			depth++;
		} else if (c === '}') {
			depth--;
			if (depth === 0) return text.slice(start, i + 1);
		}
	}
	return null;
}

type ValidationFailure = { ok: false; error: string };
type ValidationSuccess = { ok: true };

function isObject(v: unknown): v is Record<string, unknown> {
	return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function validateResult(value: unknown): ValidationSuccess | ValidationFailure {
	if (!isObject(value)) return { ok: false, error: 'Top-level value is not an object' };
	if (value.schemaVersion !== SCHEMA_VERSION) {
		return {
			ok: false,
			error: `schemaVersion mismatch: expected ${SCHEMA_VERSION}, got ${String(value.schemaVersion)}`
		};
	}
	if (typeof value.sourceSummary !== 'string') {
		return { ok: false, error: 'sourceSummary must be a string' };
	}
	if (!isObject(value.blocks)) return { ok: false, error: 'blocks must be an object' };
	const blocks = value.blocks as Record<string, unknown>;
	for (const key of REQUIRED_BLOCK_KEYS) {
		if (!(key in blocks)) return { ok: false, error: `Missing required block: ${key}` };
	}
	for (const key of [
		'visualStyle',
		'composition',
		'colorPalette',
		'typography',
		'layout',
		'onImageText',
		'aspectRatio'
	] as const) {
		const err = validateBlock(blocks[key], key);
		if (err) return { ok: false, error: err };
	}
	if (!Array.isArray(blocks.toolNotes)) {
		return { ok: false, error: 'blocks.toolNotes must be an array' };
	}
	for (const [i, note] of (blocks.toolNotes as unknown[]).entries()) {
		const err = validateBlock(note, `toolNotes[${i}]`);
		if (err) return { ok: false, error: err };
	}
	if (!Array.isArray(value.fidelityNotes)) {
		return { ok: false, error: 'fidelityNotes must be an array of strings' };
	}
	for (const note of value.fidelityNotes as unknown[]) {
		if (typeof note !== 'string') {
			return { ok: false, error: 'fidelityNotes entries must be strings' };
		}
	}
	return { ok: true };
}

function validateBlock(value: unknown, label: string): string | null {
	if (!isObject(value)) return `${label} must be an object`;
	const v = value as Record<string, unknown>;
	if (typeof v.id !== 'string' || v.id.length === 0)
		return `${label}.id must be a non-empty string`;
	if (typeof v.label !== 'string' || v.label.length === 0)
		return `${label}.label must be a non-empty string`;
	if (typeof v.content !== 'string' || v.content.length === 0)
		return `${label}.content must be a non-empty string`;
	return null;
}
