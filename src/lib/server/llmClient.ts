import { config } from './config';

interface ChatMessage {
	role: 'system' | 'user' | 'assistant';
	content: string;
}

type ReasoningEffort = 'low' | 'medium' | 'high';

interface ChatCompletionRequest {
	model: string;
	messages: ChatMessage[];
	response_format?: { type: 'json_object' };
	temperature?: number;
	max_tokens?: number;
	reasoning_effort?: ReasoningEffort;
}

interface ChatCompletionResponse {
	choices: {
		message: { content?: string | null; reasoning?: string | null };
		finish_reason?: string;
	}[];
	error?: { type?: string; message?: string; request_id?: string };
}

/**
 * Reasoning models spend part of the token budget thinking before they answer,
 * so a budget sized only for the answer returns empty visible content.
 *
 * The headroom is added on top of what the caller asked for rather than raised
 * to a flat floor: a call that needs 500 tokens of JSON does not produce better
 * output with an 8000-token ceiling, it only gives the model room to think for
 * longer, which on a shared free tier is what makes a run slow and flaky.
 */
export const REASONING_HEADROOM_TOKENS = 2000;
export const DEFAULT_MAX_TOKENS = 4000;
export const DEFAULT_REASONING_EFFORT: ReasoningEffort = 'low';

/**
 * The gateway reports a transient upstream outage as `service_unavailable` /
 * `upstream_error`, and a quota breach as `rate_limited`. All are documented as
 * retryable, and generating one carousel issues a synthesis call plus one call
 * per slide, so a single unlucky call must not fail the whole run.
 */
export const MAX_ATTEMPTS = 5;
export const RETRY_BASE_DELAY_MS = 2000;
const RETRYABLE_ERROR_TYPES = new Set(['service_unavailable', 'upstream_error', 'rate_limited']);
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function chatCompletion(
	messages: ChatMessage[],
	options: {
		jsonMode?: boolean;
		maxTokens?: number;
		temperature?: number;
		reasoningEffort?: ReasoningEffort;
	} = {}
): Promise<string> {
	let lastError: Error = new Error('LLM_NOT_ATTEMPTED');

	for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
		try {
			return await requestCompletion(messages, options);
		} catch (err) {
			lastError = err instanceof Error ? err : new Error(String(err));
			const retryable = lastError instanceof RetryableLlmError;
			if (!retryable || attempt === MAX_ATTEMPTS) break;
			// Linear backoff: the window that matters here is the per-minute
			// request limit, not an exponentially growing outage.
			await delay(RETRY_BASE_DELAY_MS * attempt);
		}
	}

	throw lastError;
}

/** Marks a failure the gateway documents as worth retrying. */
class RetryableLlmError extends Error {}

async function requestCompletion(
	messages: ChatMessage[],
	options: {
		jsonMode?: boolean;
		maxTokens?: number;
		temperature?: number;
		reasoningEffort?: ReasoningEffort;
	}
): Promise<string> {
	const requested = options.maxTokens ?? DEFAULT_MAX_TOKENS;
	const body: ChatCompletionRequest & { stream: false } = {
		model: config.llmModel,
		messages,
		temperature: options.temperature ?? 0.7,
		max_tokens: requested + REASONING_HEADROOM_TOKENS,
		reasoning_effort: options.reasoningEffort ?? DEFAULT_REASONING_EFFORT,
		stream: false
	};
	if (options.jsonMode) {
		body.response_format = { type: 'json_object' };
	}

	const res = await fetch(`${config.llmBaseUrl}/chat/completions`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${config.llmApiKey}`
		},
		body: JSON.stringify(body)
	});

	if (!res.ok) {
		const text = await res.text();
		const message = `LLM_FAILED_${res.status}: ${text.slice(0, 200)}`;
		throw RETRYABLE_STATUS.has(res.status) ? new RetryableLlmError(message) : new Error(message);
	}

	const data = (await res.json()) as ChatCompletionResponse;
	if (data.error) {
		const type = data.error.type ?? 'unknown';
		const message = `LLM_FAILED_${type}: ${data.error.message ?? ''}`;
		throw RETRYABLE_ERROR_TYPES.has(type) ? new RetryableLlmError(message) : new Error(message);
	}

	const choice = data.choices?.[0];
	const content = choice?.message?.content?.trim();
	if (!content) {
		// A truncated reasoning model spends the whole budget thinking, so name
		// that case instead of reporting a generic empty response.
		const cause = choice?.finish_reason === 'length' ? 'TRUNCATED' : 'EMPTY';
		throw new Error(
			`LLM_${cause}_RESPONSE: model ${config.llmModel} returned no content (finish_reason ${choice?.finish_reason ?? 'unknown'})`
		);
	}
	return content;
}
