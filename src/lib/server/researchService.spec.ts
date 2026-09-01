import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setPlatformEnv } from './config';
import { compileResearch, searchYouCom } from './researchService';

describe('searchYouCom', () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		setPlatformEnv({ YOU_API_KEY: 'test-key' });
	});

	it('returns parsed search results', async () => {
		globalThis.fetch = vi.fn(async () => {
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

	it('throws when key missing', async () => {
		setPlatformEnv({});
		await expect(searchYouCom('test')).rejects.toThrow('YOU_API_KEY is not configured');
		setPlatformEnv({ YOU_API_KEY: 'test-key' });
	});

	it('throws on non-OK response', async () => {
		globalThis.fetch = vi.fn(
			async () => new Response('error', { status: 500 })
		) as unknown as typeof fetch;
		await expect(searchYouCom('test')).rejects.toThrow('YOU_SEARCH_FAILED_500');
		globalThis.fetch = originalFetch;
	});
});

describe('compileResearch', () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		setPlatformEnv({ YOU_API_KEY: 'test-key' });
	});

	it('returns brief with numbered sources', async () => {
		globalThis.fetch = vi.fn(async () => {
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
		globalThis.fetch = vi.fn(
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
