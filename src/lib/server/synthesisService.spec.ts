import { describe, expect, it } from 'vitest';
import { parseSynthesisResponse, SYNTHESIS_SYSTEM_PROMPT } from './synthesisService';

/** One well-formed slide; helpers below vary single fields from this baseline. */
function slide(overrides: Record<string, unknown> = {}) {
	return {
		slide_index: 0,
		slide_type: 'hook',
		slide_title: 'Kenapa kolom disebut jantung bangunan?',
		slide_subtitle: 'Untuk bangunan beton bertulang',
		slide_explanation:
			'Kolom menyalurkan beban dari lantai ke fondasi. Tanpa jalur beban itu, struktur kehilangan penyangga utamanya.',
		visual_labels: 'kolom | balok | fondasi | arah beban',
		slide_takeaway: 'Kolom adalah jalur beban vertikal utama.',
		research_context: 'Sumber menjelaskan fungsi kolom sebagai penyalur beban.',
		...overrides
	};
}

function response(slides: unknown[]) {
	return JSON.stringify({ topic: 'Kegunaan Kolom Bangunan', slides });
}

describe('parseSynthesisResponse teaching fields', () => {
	it('returns the six teaching fields', () => {
		const parsed = parseSynthesisResponse(response([slide()]), 1);
		expect(parsed).toHaveLength(1);
		expect(parsed[0]?.slide_title).toContain('jantung bangunan');
		expect(parsed[0]?.slide_subtitle).toBe('Untuk bangunan beton bertulang');
		expect(parsed[0]?.slide_explanation).toContain('menyalurkan beban');
		expect(parsed[0]?.visual_labels).toContain('fondasi');
		expect(parsed[0]?.slide_takeaway).toContain('jalur beban');
	});

	it('keeps the explanation separate from the title', () => {
		const parsed = parseSynthesisResponse(response([slide()]), 1);
		expect(parsed[0]?.slide_explanation).not.toBe(parsed[0]?.slide_title);
	});

	it('fails when a headline is missing', () => {
		expect(() => parseSynthesisResponse(response([slide({ slide_title: '' })]), 1)).toThrow(
			'SYNTHESIS_MISSING_TITLE'
		);
		expect(() => parseSynthesisResponse(response([slide({ slide_title: undefined })]), 1)).toThrow(
			'SYNTHESIS_MISSING_TITLE'
		);
	});

	it('fails when an explanation is missing', () => {
		expect(() => parseSynthesisResponse(response([slide({ slide_explanation: '' })]), 1)).toThrow(
			'SYNTHESIS_MISSING_EXPLANATION'
		);
		expect(() =>
			parseSynthesisResponse(response([slide({ slide_explanation: '   ' })]), 1)
		).toThrow('SYNTHESIS_MISSING_EXPLANATION');
	});

	it('defaults optional fields to empty rather than inventing content', () => {
		const parsed = parseSynthesisResponse(
			response([
				slide({ slide_subtitle: undefined, visual_labels: undefined, slide_takeaway: undefined })
			]),
			1
		);
		expect(parsed[0]?.slide_subtitle).toBe('');
		expect(parsed[0]?.visual_labels).toBe('');
		expect(parsed[0]?.slide_takeaway).toBe('');
	});

	it('preserves a source qualifier exactly as supplied', () => {
		// The reviewed sample dropped "hampir" from "hampir 95%", overstating the source.
		const qualified = slide({
			slide_explanation: 'Sumber menyebut hampir 95% bangunan memakai kolom terikat.',
			slide_takeaway: 'Mayoritas bangunan memakai kolom terikat.'
		});
		const parsed = parseSynthesisResponse(response([qualified]), 1);
		expect(parsed[0]?.slide_explanation).toContain('hampir 95%');
		expect(parsed[0]?.slide_explanation).not.toMatch(/(?<!hampir )\b95%/);
	});

	it('does not rewrite or truncate the explanation it receives', () => {
		const long = 'Kolom menyalurkan beban aksial dari balok dan pelat menuju fondasi bangunan.';
		const parsed = parseSynthesisResponse(response([slide({ slide_explanation: long })]), 1);
		expect(parsed[0]?.slide_explanation).toBe(long);
	});

	it('forces hook first and cta last', () => {
		const parsed = parseSynthesisResponse(
			response([
				slide({ slide_index: 0, slide_type: 'custom' }),
				slide({ slide_index: 1, slide_type: 'custom' }),
				slide({ slide_index: 2, slide_type: 'custom' })
			]),
			3
		);
		expect(parsed[0]?.slide_type).toBe('hook');
		expect(parsed[2]?.slide_type).toBe('cta');
	});

	it('recovers from a markdown fence', () => {
		const raw = '```json\n' + response([slide()]) + '\n```';
		expect(parseSynthesisResponse(raw, 1)[0]?.slide_explanation).toContain('menyalurkan beban');
	});

	it('fails when no JSON object is present', () => {
		expect(() => parseSynthesisResponse('no json here', 1)).toThrow('SYNTHESIS_NO_JSON');
	});

	it('fails when the slides array is absent', () => {
		expect(() => parseSynthesisResponse(JSON.stringify({ topic: 'x' }), 1)).toThrow(
			'SYNTHESIS_INVALID_FORMAT'
		);
	});
});

describe('human practitioner voice instruction', () => {
	it('asks for a practitioner voice rather than a report', () => {
		expect(SYNTHESIS_SYSTEM_PROMPT).toContain('practitioner');
		expect(SYNTHESIS_SYSTEM_PROMPT).toContain('not as a report');
	});

	it('sets kamu as the default address', () => {
		expect(SYNTHESIS_SYSTEM_PROMPT).toContain('Address the reader as "kamu"');
		expect(SYNTHESIS_SYSTEM_PROMPT).toContain('formal institutional register');
	});

	it('names the filler attribution the reviewed sample produced', () => {
		expect(SYNTHESIS_SYSTEM_PROMPT).toContain('Sumber menjelaskan bahwa');
		expect(SYNTHESIS_SYSTEM_PROMPT).toContain('Sumber menyarankan agar');
		expect(SYNTHESIS_SYSTEM_PROMPT).toContain('para ahli sepakat');
	});

	it('names the remaining template patterns to avoid', () => {
		expect(SYNTHESIS_SYSTEM_PROMPT).toContain('Anda akan mempelajari');
		expect(SYNTHESIS_SYSTEM_PROMPT).toContain('bukan sekadar X, tetapi Y');
		expect(SYNTHESIS_SYSTEM_PROMPT).toContain('Pelajari. Bandingkan. Putuskan');
		expect(SYNTHESIS_SYSTEM_PROMPT).toContain('Making every slide_title a question');
	});

	it('asks for varied sentence length without mechanical alternation', () => {
		expect(SYNTHESIS_SYSTEM_PROMPT).toContain('Vary sentence length');
		expect(SYNTHESIS_SYSTEM_PROMPT).toContain('do not alternate mechanically');
	});

	it('requires natural Indonesian connectors', () => {
		expect(SYNTHESIS_SYSTEM_PROMPT).toContain('padahal');
		expect(SYNTHESIS_SYSTEM_PROMPT).toContain('soalnya');
		expect(SYNTHESIS_SYSTEM_PROMPT).toContain('selain itu');
	});

	it('forbids literal translated-English phrasing', () => {
		expect(SYNTHESIS_SYSTEM_PROMPT).toContain('di penghujung hari');
		expect(SYNTHESIS_SYSTEM_PROMPT).toContain('mari kita breakdown');
	});

	it('forbids invented first-person experience', () => {
		expect(SYNTHESIS_SYSTEM_PROMPT).toContain('Never claim first-person experience');
		expect(SYNTHESIS_SYSTEM_PROMPT).toContain('clearly hypothetical');
	});

	it('keeps fact fidelity above voice', () => {
		expect(SYNTHESIS_SYSTEM_PROMPT).toContain('Fact fidelity outranks voice');
		expect(SYNTHESIS_SYSTEM_PROMPT).toContain('hampir 95%');
	});

	it('keeps the existing sensationalism ban', () => {
		expect(SYNTHESIS_SYSTEM_PROMPT).toContain('sensationalism');
		expect(SYNTHESIS_SYSTEM_PROMPT).toContain('pasti runtuh');
	});

	it('carries no detector-evasion instruction', () => {
		const lowered = SYNTHESIS_SYSTEM_PROMPT.toLowerCase();
		expect(lowered).not.toContain('detector');
		expect(lowered).not.toContain('detection');
		expect(lowered).not.toContain('undetectable');
		expect(lowered).not.toContain('sound human');
		expect(lowered).not.toContain('perplexity');
		expect(lowered).not.toContain('burstiness');
	});
});
