import { config } from './config';

interface ChatMessage {
	role: 'system' | 'user' | 'assistant';
	content: string;
}

interface ChatCompletionRequest {
	model: string;
	messages: ChatMessage[];
	response_format?: { type: 'json_object' };
	temperature?: number;
	max_tokens?: number;
}

interface ChatCompletionResponse {
	choices: { message: { content: string } }[];
}

export async function chatCompletion(
	messages: ChatMessage[],
	options: { jsonMode?: boolean; maxTokens?: number; temperature?: number } = {}
): Promise<string> {
	const body: ChatCompletionRequest = {
		model: config.openRouterModel,
		messages,
		temperature: options.temperature ?? 0.7,
		max_tokens: options.maxTokens ?? 4000
	};
	if (options.jsonMode) {
		body.response_format = { type: 'json_object' };
	}

	const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${config.openRouterApiKey}`
		},
		body: JSON.stringify(body)
	});

	if (!res.ok) {
		const text = await res.text();
		throw new Error(`OPENROUTER_FAILED_${res.status}: ${text.slice(0, 200)}`);
	}

	const data = (await res.json()) as ChatCompletionResponse;
	const content = data.choices?.[0]?.message?.content;
	if (!content) {
		throw new Error('OPENROUTER_EMPTY_RESPONSE');
	}
	return content;
}
