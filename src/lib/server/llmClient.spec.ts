import { afterEach, describe, expect, it, vi } from 'vitest';
import { setPlatformEnv } from './config';
import { chatCompletion } from './llmClient';

describe('chatCompletion', () => {
	const originalFetch = globalThis.fetch;

	afterEach(() => {
		globalThis.fetch = originalFetch;
		setPlatformEnv(null);
		vi.restoreAllMocks();
	});

	it('requests non-streaming JSON from OpenAI-compatible gateways', async () => {
		const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
			const body = JSON.parse(String(init?.body)) as { stream?: boolean };
			expect(body.stream).toBe(false);
			return new Response(
				JSON.stringify({
					choices: [{ message: { content: 'ok' }, finish_reason: 'stop' }]
				}),
				{ status: 200, headers: { 'content-type': 'application/json' } }
			);
		});
		globalThis.fetch = fetchMock as unknown as typeof fetch;
		setPlatformEnv({
			LLM_BASE_URL: 'https://gateway.example/v1',
			LLM_API_KEY: 'test-key',
			LLM_MODEL: 'test-model'
		});

		await expect(chatCompletion([{ role: 'user', content: 'Reply ok' }])).resolves.toBe('ok');
		expect(fetchMock).toHaveBeenCalledOnce();
	});
});
