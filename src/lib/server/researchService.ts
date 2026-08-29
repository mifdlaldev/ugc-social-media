/**
 * Research service: fetch real-time data via You.com search.
 *
 * You.com is the only search provider in this MVP (per openspec change social-media-revamp).
 * Uses the public You.com web search endpoint.
 */

import { config } from './config';

export interface SearchResult {
	title: string;
	url: string;
	snippet: string;
}

export interface ResearchBrief {
	sources: SearchResult[];
	brief: string;
	topic: string;
}

const YOU_SEARCH_URL = 'https://api.you.com/v1/web-search';

export async function searchYouCom(query: string, limit = 10): Promise<SearchResult[]> {
	const apiKey = config.youApiKey;
	const url = new URL(YOU_SEARCH_URL);
	url.searchParams.set('query', query);
	url.searchParams.set('num_web_results', String(limit));

	const res = await fetch(url.toString(), {
		headers: {
			Accept: 'application/json',
			'X-API-Key': apiKey
		}
	});

	if (!res.ok) {
		throw new Error(`YOU_SEARCH_FAILED_${res.status}`);
	}

	const data = (await res.json()) as {
		results?: {
			web?: { title: string; url: string; description?: string; snippets?: string[] }[];
		};
	};

	const webResults = data.results?.web ?? [];
	return webResults.slice(0, limit).map((r) => ({
		title: r.title,
		url: r.url,
		snippet: r.snippets?.[0] ?? r.description ?? ''
	}));
}

export async function compileResearch(topic: string): Promise<ResearchBrief> {
	const sources = await searchYouCom(topic, 10);
	if (sources.length === 0) {
		throw new Error('RESEARCH_EMPTY');
	}

	const brief = sources
		.map((s, i) => `[${i + 1}] ${s.title}\n${s.snippet}\nURL: ${s.url}`)
		.join('\n\n');

	return { sources, brief, topic };
}