import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { config, setPlatformEnv } from './config';
import { compileResearch, searchYouCom } from './researchService';

describe('searchYouCom', () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		setPlatformEnv({ YOU_API_KEY: 'test-key', RESEARCH_RESULT_COUNT: '30' });
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
		setPlatformEnv(null);
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
	});

	it('throws when key missing', async () => {
		setPlatformEnv({ RESEARCH_RESULT_COUNT: '30' });
		await expect(searchYouCom('test')).rejects.toThrow('YOU_API_KEY is not configured');
	});

	it('throws when RESEARCH_RESULT_COUNT is missing', async () => {
		setPlatformEnv({ YOU_API_KEY: 'test-key' });
		await expect(searchYouCom('test')).rejects.toThrow('RESEARCH_RESULT_COUNT is not configured');
		setPlatformEnv({ YOU_API_KEY: 'test-key', RESEARCH_RESULT_COUNT: '30' });
	});

	it('throws on non-OK response', async () => {
		globalThis.fetch = vi.fn(
			async () => new Response('error', { status: 500 })
		) as unknown as typeof fetch;
		await expect(searchYouCom('test')).rejects.toThrow('YOU_SEARCH_FAILED_500');
	});

	it('filters results with empty URL', async () => {
		globalThis.fetch = vi.fn(async () => {
			return new Response(
				JSON.stringify({
					results: {
						web: [
							{ title: 'A', url: '', snippets: ['Snippet A'] },
							{ title: 'B', url: 'https://b.com', snippets: ['Snippet B'] }
						]
					}
				}),
				{ status: 200, headers: { 'content-type': 'application/json' } }
			);
		}) as unknown as typeof fetch;

		const results = await searchYouCom('test', 10);
		expect(results).toHaveLength(1);
		expect(results[0]?.url).toBe('https://b.com');
	});

	it('filters results with empty snippet', async () => {
		globalThis.fetch = vi.fn(async () => {
			return new Response(
				JSON.stringify({
					results: {
						web: [
							{ title: 'A', url: 'https://a.com', snippets: [''] },
							{ title: 'B', url: 'https://b.com', snippets: ['  '] },
							{ title: 'C', url: 'https://c.com', snippets: ['Snippet C'] }
						]
					}
				}),
				{ status: 200, headers: { 'content-type': 'application/json' } }
			);
		}) as unknown as typeof fetch;

		const results = await searchYouCom('test', 10);
		expect(results).toHaveLength(1);
		expect(results[0]?.url).toBe('https://c.com');
	});

	it('deduplicates by URL, keeping the first occurrence', async () => {
		globalThis.fetch = vi.fn(async () => {
			return new Response(
				JSON.stringify({
					results: {
						web: [
							{ title: 'A1', url: 'https://same.com', snippets: ['First'] },
							{ title: 'A2', url: 'https://same.com', snippets: ['Second'] }
						]
					}
				}),
				{ status: 200, headers: { 'content-type': 'application/json' } }
			);
		}) as unknown as typeof fetch;

		const results = await searchYouCom('test', 10);
		expect(results).toHaveLength(1);
		expect(results[0]?.title).toBe('A1');
	});

	it('deduplicates by URL case-insensitively', async () => {
		globalThis.fetch = vi.fn(async () => {
			return new Response(
				JSON.stringify({
					results: {
						web: [
							{ title: 'A', url: 'https://Example.com', snippets: ['First'] },
							{ title: 'B', url: 'https://example.com', snippets: ['Second'] }
						]
					}
				}),
				{ status: 200, headers: { 'content-type': 'application/json' } }
			);
		}) as unknown as typeof fetch;

		const results = await searchYouCom('test', 10);
		expect(results).toHaveLength(1);
		expect(results[0]?.title).toBe('A');
	});

	it('excludes URLs in the excludeUrls set', async () => {
		globalThis.fetch = vi.fn(async () => {
			return new Response(
				JSON.stringify({
					results: {
						web: [
							{ title: 'A', url: 'https://a.com', snippets: ['Snippet A'] },
							{ title: 'B', url: 'https://b.com', snippets: ['Snippet B'] }
						]
					}
				}),
				{ status: 200, headers: { 'content-type': 'application/json' } }
			);
		}) as unknown as typeof fetch;

		const results = await searchYouCom('test', 10, new Set(['https://a.com']));
		expect(results).toHaveLength(1);
		expect(results[0]?.url).toBe('https://b.com');
	});

	it('passes configured RESEARCH_RESULT_COUNT to the API', async () => {
		let capturedUrl = '';
		globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
			capturedUrl = String(input);
			return new Response(JSON.stringify({ results: { web: [] } }), {
				status: 200,
				headers: { 'content-type': 'application/json' }
			});
		}) as unknown as typeof fetch;

		setPlatformEnv({ YOU_API_KEY: 'test-key', RESEARCH_RESULT_COUNT: '42' });
		await searchYouCom('test');
		expect(capturedUrl).toContain('num_web_results=42');
	});
});

describe('compileResearch', () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		setPlatformEnv({ YOU_API_KEY: 'test-key', RESEARCH_RESULT_COUNT: '30' });
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
		setPlatformEnv(null);
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
	});

	it('throws RESEARCH_EMPTY when all results are filtered out', async () => {
		globalThis.fetch = vi.fn(async () => {
			return new Response(
				JSON.stringify({
					results: {
						web: [
							{ title: 'A', url: '', snippets: ['Snippet'] },
							{ title: 'B', url: 'https://b.com', snippets: [''] }
						]
					}
				}),
				{ status: 200, headers: { 'content-type': 'application/json' } }
			);
		}) as unknown as typeof fetch;

		await expect(compileResearch('test')).rejects.toThrow('RESEARCH_EMPTY');
	});

	it('excludes previously persisted URLs and returns new sources', async () => {
		globalThis.fetch = vi.fn(async () => {
			return new Response(
				JSON.stringify({
					results: {
						web: [
							{ title: 'Old', url: 'https://old.com', snippets: ['Old snippet'] },
							{ title: 'New', url: 'https://new.com', snippets: ['New snippet'] }
						]
					}
				}),
				{ status: 200, headers: { 'content-type': 'application/json' } }
			);
		}) as unknown as typeof fetch;

		const result = await compileResearch('test', {
			excludeUrls: new Set(['https://old.com'])
		});

		expect(result.sources).toHaveLength(1);
		expect(result.sources[0]?.url).toBe('https://new.com');
	});
});

describe('config researchResultCount', () => {
	it('returns a positive integer when valid', async () => {
		setPlatformEnv({ RESEARCH_RESULT_COUNT: '50' });
		expect(config.researchResultCount).toBe(50);
	});

	it('throws when missing', async () => {
		setPlatformEnv({});
		expect(() => config.researchResultCount).toThrow('RESEARCH_RESULT_COUNT is not configured');
	});

	it('throws when zero', async () => {
		setPlatformEnv({ RESEARCH_RESULT_COUNT: '0' });
		expect(() => config.researchResultCount).toThrow(
			'RESEARCH_RESULT_COUNT must be a positive integer'
		);
	});

	it('throws when negative', async () => {
		setPlatformEnv({ RESEARCH_RESULT_COUNT: '-5' });
		expect(() => config.researchResultCount).toThrow(
			'RESEARCH_RESULT_COUNT must be a positive integer'
		);
	});

	it('throws when not a number', async () => {
		setPlatformEnv({ RESEARCH_RESULT_COUNT: 'abc' });
		expect(() => config.researchResultCount).toThrow(
			'RESEARCH_RESULT_COUNT must be a positive integer'
		);
	});

	it('throws when float', async () => {
		setPlatformEnv({ RESEARCH_RESULT_COUNT: '3.5' });
		expect(() => config.researchResultCount).toThrow(
			'RESEARCH_RESULT_COUNT must be a positive integer'
		);
	});
});
