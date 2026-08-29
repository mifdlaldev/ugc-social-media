/**
 * Conservative fact-fidelity guard.
 * Goal: catch obvious fact injection from the LLM. This is NOT semantic verification.
 *
 * Strategy:
 *  1. Tokenize the article into lowercase terms: numbers (with units) and "named terms"
 *     (multi-word capitalized phrases, single capitalized words, and quoted phrases).
 *  2. Concatenate all generated block contents and the sourceSummary.
 *  3. Reject any generated token that is a quoted/isolated number or a capitalized named term
 *     that does not appear (case-insensitive) in the article.
 *
 * This intentionally tolerates common stopwords, generic words, and lowercase prose.
 * It flags the kind of obvious "the Eiffel Tower" or "42 MPa" hallucination we want to prevent.
 */

const STOPWORDS = new Set([
	'visual',
	'style',
	'composition',
	'layout',
	'color',
	'colour',
	'palette',
	'typography',
	'font',
	'image',
	'infographic',
	'post',
	'story',
	'feed',
	'square',
	'portrait',
	'landscape',
	'background',
	'foreground',
	'text',
	'title',
	'header',
	'footer',
	'caption',
	'icon',
	'border',
	'margin',
	'padding',
	'alignment',
	'grid',
	'safe',
	'area',
	'top',
	'bottom',
	'left',
	'right',
	'center',
	'colour',
	'color',
	'line',
	'lines',
	'shape',
	'shapes',
	'ratio',
	'aspect',
	'tall',
	'wide',
	'clean',
	'bold',
	'minimalist',
	'flat',
	'flat-design',
	'modern',
	'classic',
	'instagram',
	'facebook',
	'tiktok',
	'twitter',
	'linkedin',
	'prompt',
	'generated',
	'render',
	'resolution',
	'high',
	'low',
	'medium',
	'large',
	'small',
	'format',
	'vertical',
	'horizontal'
]);

export type FidelityResult = { ok: true } | { ok: false; rejectedTokens: string[] };

export function checkFactFidelity(
	article: string,
	result: { sourceSummary: string; blocks: Record<string, { content: string }> }
): FidelityResult {
	const articleTokens = collectFactualTokens(article);
	const generatedTokens = collectGeneratedTokens(result);

	const rejected: string[] = [];
	for (const token of generatedTokens) {
		if (STOPWORDS.has(token.value)) continue;
		if (token.value.length < 3) continue;
		if (
			token.type === 'number' &&
			/\d{4,}|\d+(\.\d+)?\s?(mm|cm|m|km|kg|kn|kN|MPa|psi|°C|°F|%)/.test(token.value)
		) {
			if (!articleTokens.some((t) => t.value === token.value)) {
				rejected.push(token.value);
			}
		} else if (token.type === 'named') {
			if (!articleTokens.some((t) => t.value === token.value)) {
				rejected.push(token.value);
			}
		}
	}
	if (rejected.length > 0) return { ok: false, rejectedTokens: Array.from(new Set(rejected)) };
	return { ok: true };
}

type Token = { type: 'number' | 'named'; value: string };

function collectFactualTokens(article: string): Token[] {
	const out: Token[] = [];
	// Numbers with units
	for (const m of article.matchAll(/(\d+(?:\.\d+)?)\s?(mm|cm|m|km|kg|kn|kN|MPa|psi|°C|°F|%)/gi)) {
		out.push({ type: 'number', value: m[0].replace(/\s+/g, '').toLowerCase() });
	}
	// Capitalized named terms: only MULTI-WORD phrases are treated as genuine
	// proper nouns. Single capitalized words are ambiguous (sentence start in
	// Indonesian), so they are intentionally ignored to avoid noise.
	const phraseRegex = /\b([A-Z][a-zA-Z0-9-]+(?:\s+[A-Z][a-zA-Z0-9-]+)+)\b/g;
	for (const m of article.matchAll(phraseRegex)) {
		out.push({ type: 'named', value: m[1].toLowerCase() });
	}
	return out;
}

function collectGeneratedTokens(result: {
	sourceSummary: string;
	blocks: Record<string, { content: string }>;
}): Token[] {
	const out: Token[] = [];
	const blob = [result.sourceSummary, ...Object.values(result.blocks).map((b) => b.content)].join(
		'\n'
	);
	for (const m of blob.matchAll(/(\d+(?:\.\d+)?)\s?(mm|cm|m|km|kg|kn|kN|MPa|psi|°C|°F|%)/gi)) {
		out.push({ type: 'number', value: m[0].replace(/\s+/g, '').toLowerCase() });
	}
	// Capitalized named terms: only multi-word phrases (genuine proper nouns).
	const phraseRegex = /\b([A-Z][a-zA-Z0-9-]+(?:\s+[A-Z][a-zA-Z0-9-]+)+)\b/g;
	for (const m of blob.matchAll(phraseRegex)) {
		out.push({ type: 'named', value: m[1].toLowerCase() });
	}
	return out;
}
