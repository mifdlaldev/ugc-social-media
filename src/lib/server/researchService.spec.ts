import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { compileResearch, searchYouCom } from './researchService';

describe('searchYouCom', () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		process.env.YOU_API_KEY = 'test-key';
	});

	it('returns parsed search results', async () => {
		globalThis.fetch = mock(async () => {
			return new Response(
				JSON.stringify({
					results: {
						web: [
							{
								title: 'Bata Ringan vs Bata Merah',
								url: 'https://example.com/bata',
								snippets: ['Bata ringan lebih mahal.', 'Bata merah lebih kuat.']
							},
							{
								title: 'Harga Bata 2025',
								url: 'https://example.com/harga',
								description: 'Update harga bata terbaru'
							}
						]
					}
				}),
				{ status: 200, headers: { 'content-type': 'application/json' } }
			);
		}) as unknown as typeof fetch;

		const results = await searchYouCom('bata merah vs bata ringan', 5);

		expect(results).toHaveLength(2);
		expect(results[0]?.title).toBe('Bata Ringan vs Bata Merah');
		expect(results[0]?.snippet).toBe('Bata ringan lebih mahal.');
		expect(results[1]?.snippet).toBe('Update harga bata terbaru');

		globalThis.fetch = originalFetch;
	});

	it('throws YOU_API_KEY_NOT_SET when key missing', async () => {
		delete process.env.YOU_API_KEY;
		await expect(searchYouCom('test')).rejects.toThrow('YOU_API_KEY_NOT_SET');
	});

	it('throws on non-OK response', async () => {
		globalThis.fetch = mock(async () => new Response('error', { status: 500 })) as unknown as typeof fetch;
		await expect(searchYouCom('test')).rejects.toThrow('YOU_SEARCH_FAILED_500');
		globalThis.fetch = originalFetch;
	});
});

describe('compileResearch', () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		process.env.YOU_API_KEY = 'test-key';
	});

	it('returns brief with numbered sources', async () => {
		globalThis.fetch = mock(async () => {
			return new Response(
				JSON.stringify({
					results: {
						web: [
							{
								title: 'A',
								url: 'https://a.com',
								snippets: ['Snippet A']
							},
							{
								title: 'B',
								url: 'https://b.com',
								snippets: ['Snippet B']
							}
						]
					}
				}),
				{ status: 200, headers: { 'content-type': 'application/json' } }
			);
		}) as unknown as typeof fetch;

		const result = await compileResearch('bata');

		expect(result.topic).toBe('bata');
		expect(result.sources).toHaveLength(2);
		expect(result.brief).toContain('[1] A');
		expect(result.brief).toContain('[2] B');
		expect(result.brief).toContain('https://a.com');

		globalThis.fetch = originalFetch;
	});

	it('throws RESEARCH_EMPTY when no results', async () => {
		globalThis.fetch = mock(
			async () =>
				new Response(JSON.stringify({ results: { web: [] } }), {
					status: 200,
					headers: { 'content-type': 'application/json' }
				})
		) as unknown as typeof fetch;

		await expect(compileResearch('nothing')).rejects.toThrow('RESEARCH_EMPTY');
		globalThis.fetch = originalFetch;
	});
});