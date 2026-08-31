import { describe, expect, it } from 'vitest';
import {
	MAX_ALTERNATIVES,
	MAX_REASON_LENGTH,
	RECOMMENDATION_SYSTEM_PROMPT,
	parseRecommendationResponse
} from './visualCommandRecommendation';

const SLIDE_COUNT = 5;

function response(overrides: Record<string, unknown> = {}) {
	return JSON.stringify({
		primary: {
			command: '/comparison',
			reason: 'Topik menyandingkan dua material, jadi bentuk berdampingan paling pas.'
		},
		alternatives: [{ command: '/scale', reason: 'Bisa dipakai kalau fokusnya beda ukuran.' }],
		per_slide: [
			{ slide_index: 0, command: '/comparison', reason: 'Hook memperkenalkan dua pilihan.' }
		],
		...overrides
	});
}

describe('parseRecommendationResponse', () => {
	it('reads a well-formed recommendation', () => {
		const parsed = parseRecommendationResponse(response(), SLIDE_COUNT);
		expect(parsed.primary.command).toBe('/comparison');
		expect(parsed.primary.reason).toContain('berdampingan');
		expect(parsed.alternatives).toHaveLength(1);
		expect(parsed.alternatives[0]?.command).toBe('/scale');
		expect(parsed.per_slide?.[0]?.slide_index).toBe(0);
	});

	it('recovers JSON from a markdown fence', () => {
		const raw = '```json\n' + response() + '\n```';
		expect(parseRecommendationResponse(raw, SLIDE_COUNT).primary.command).toBe('/comparison');
	});

	it('recovers JSON surrounded by prose', () => {
		const raw = `Here you go:\n${response()}\nHope that helps.`;
		expect(parseRecommendationResponse(raw, SLIDE_COUNT).primary.command).toBe('/comparison');
	});

	it('accepts an absent per_slide plan', () => {
		const parsed = parseRecommendationResponse(response({ per_slide: undefined }), SLIDE_COUNT);
		expect(parsed.per_slide).toBeNull();
	});

	it('accepts an empty per_slide array as no plan', () => {
		const parsed = parseRecommendationResponse(response({ per_slide: [] }), SLIDE_COUNT);
		expect(parsed.per_slide).toBeNull();
	});

	it('accepts an absent alternatives array', () => {
		const parsed = parseRecommendationResponse(response({ alternatives: undefined }), SLIDE_COUNT);
		expect(parsed.alternatives).toEqual([]);
	});
});

describe('catalog constraint', () => {
	it('rejects an invented primary command', () => {
		// A silent substitution is exactly the failure this guard exists to prevent.
		expect(() =>
			parseRecommendationResponse(
				response({ primary: { command: '/sidebyside', reason: 'x' } }),
				SLIDE_COUNT
			)
		).toThrow('RECOMMENDATION_UNKNOWN_COMMAND');
	});

	it('rejects an invented alternative command', () => {
		expect(() =>
			parseRecommendationResponse(
				response({ alternatives: [{ command: '/versus', reason: 'x' }] }),
				SLIDE_COUNT
			)
		).toThrow('RECOMMENDATION_UNKNOWN_COMMAND');
	});

	it('rejects an invented per-slide command', () => {
		expect(() =>
			parseRecommendationResponse(
				response({ per_slide: [{ slide_index: 1, command: '/mindmap', reason: 'x' }] }),
				SLIDE_COUNT
			)
		).toThrow('RECOMMENDATION_UNKNOWN_COMMAND');
	});

	it('does not fall back to a default command', () => {
		try {
			parseRecommendationResponse(
				response({ primary: { command: '/nope', reason: 'x' } }),
				SLIDE_COUNT
			);
			throw new Error('expected a throw');
		} catch (err) {
			expect((err as Error).message).toBe('RECOMMENDATION_UNKNOWN_COMMAND');
		}
	});

	it('accepts every command the catalog does', () => {
		for (const command of ['/blueprint', '/cutaway', '/handwrittennotes', '/infographic']) {
			const parsed = parseRecommendationResponse(
				response({ primary: { command, reason: 'alasan bentuk visual' }, per_slide: undefined }),
				SLIDE_COUNT
			);
			expect(parsed.primary.command, command).toBe(command);
		}
	});
});

describe('malformed responses', () => {
	it('fails when no JSON object is present', () => {
		expect(() => parseRecommendationResponse('no json here', SLIDE_COUNT)).toThrow(
			'RECOMMENDATION_NO_JSON'
		);
	});

	it('fails on malformed JSON rather than a raw SyntaxError', () => {
		expect(() => parseRecommendationResponse('{ "primary": }', SLIDE_COUNT)).toThrow(
			'RECOMMENDATION_INVALID_JSON'
		);
	});

	it('fails when primary is missing', () => {
		expect(() =>
			parseRecommendationResponse(response({ primary: undefined }), SLIDE_COUNT)
		).toThrow('RECOMMENDATION_MISSING_PRIMARY');
	});

	it('fails when a reason is missing or empty', () => {
		expect(() =>
			parseRecommendationResponse(
				response({ primary: { command: '/comparison', reason: '' } }),
				SLIDE_COUNT
			)
		).toThrow('RECOMMENDATION_MISSING_REASON');
	});

	it('fails when alternatives is not an array', () => {
		expect(() =>
			parseRecommendationResponse(response({ alternatives: 'nope' }), SLIDE_COUNT)
		).toThrow('RECOMMENDATION_INVALID_ALTERNATIVES');
	});

	it('rejects more than the permitted number of alternatives', () => {
		const tooMany = Array.from({ length: MAX_ALTERNATIVES + 1 }, () => ({
			command: '/scale',
			reason: 'alasan'
		}));
		expect(() =>
			parseRecommendationResponse(response({ alternatives: tooMany }), SLIDE_COUNT)
		).toThrow('RECOMMENDATION_TOO_MANY_ALTERNATIVES');
	});

	it('fails when per_slide is not an array', () => {
		expect(() => parseRecommendationResponse(response({ per_slide: 'nope' }), SLIDE_COUNT)).toThrow(
			'RECOMMENDATION_INVALID_PER_SLIDE'
		);
	});

	it('fails when a slide index is not an integer', () => {
		expect(() =>
			parseRecommendationResponse(
				response({ per_slide: [{ slide_index: 1.5, command: '/comparison', reason: 'x' }] }),
				SLIDE_COUNT
			)
		).toThrow('RECOMMENDATION_INVALID_PER_SLIDE');
	});

	it('fails when a slide index falls outside the carousel', () => {
		expect(() =>
			parseRecommendationResponse(
				response({
					per_slide: [{ slide_index: SLIDE_COUNT, command: '/comparison', reason: 'x' }]
				}),
				SLIDE_COUNT
			)
		).toThrow('RECOMMENDATION_SLIDE_INDEX_OUT_OF_RANGE');
	});

	it('truncates an overlong reason rather than failing', () => {
		const long = 'a'.repeat(MAX_REASON_LENGTH + 50);
		const parsed = parseRecommendationResponse(
			response({ primary: { command: '/comparison', reason: long }, per_slide: undefined }),
			SLIDE_COUNT
		);
		expect(parsed.primary.reason).toHaveLength(MAX_REASON_LENGTH);
	});
});

describe('recommendation instruction', () => {
	it('constrains values to the supplied catalog', () => {
		expect(RECOMMENDATION_SYSTEM_PROMPT).toContain('copied exactly from the supplied catalog');
		expect(RECOMMENDATION_SYSTEM_PROMPT).toContain('Never invent a command');
	});

	it('forbids introducing new facts in a reason', () => {
		expect(RECOMMENDATION_SYSTEM_PROMPT).toContain('must NOT introduce an engineering fact');
		expect(RECOMMENDATION_SYSTEM_PROMPT).toContain('standard');
	});

	it('forbids efficacy claims', () => {
		expect(RECOMMENDATION_SYSTEM_PROMPT).toContain('better image');
		expect(RECOMMENDATION_SYSTEM_PROMPT).toContain('more engagement');
		expect(RECOMMENDATION_SYSTEM_PROMPT).toContain('will comply');
	});

	it('describes the shape-matching rule without naming a fixed mapping', () => {
		expect(RECOMMENDATION_SYSTEM_PROMPT).toContain('two named subjects against each other');
		expect(RECOMMENDATION_SYSTEM_PROMPT).toContain('several independent points');
	});

	it('caps alternatives and makes the per-slide plan optional', () => {
		expect(RECOMMENDATION_SYSTEM_PROMPT).toContain(`at most ${MAX_ALTERNATIVES} entries`);
		expect(RECOMMENDATION_SYSTEM_PROMPT).toContain('"per_slide" is optional');
	});

	it('asks for Indonesian reasons', () => {
		expect(RECOMMENDATION_SYSTEM_PROMPT).toContain('Write reasons in Indonesian');
	});
});
