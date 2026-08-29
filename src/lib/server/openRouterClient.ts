import { config } from './config';
import { SYSTEM_PROMPT, SCHEMA_VERSION } from './promptSchema';

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export type ChatCompletion = {
	id: string;
	choices: {
		index: number;
		message: { role: 'assistant'; content: string };
		finish_reason: string;
	}[];
	model: string;
};

export class OpenRouterError extends Error {
	constructor(
		message: string,
		public readonly status: number,
		public readonly code: string
	) {
		super(message);
	}
}

export async function chatCompletion(
	messages: ChatMessage[],
	options?: { model?: string; temperature?: number; maxTokens?: number }
): Promise<ChatCompletion> {
	const model = options?.model ?? config.openRouterModel;
	const body = {
		model,
		messages,
		temperature: options?.temperature ?? 0.4,
		max_tokens: options?.maxTokens ?? 2000,
		response_format: { type: 'json_object' }
	};
	const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${config.openRouterApiKey}`,
			'Content-Type': 'application/json',
			'HTTP-Referer': 'https://ugc-social-media.local',
			'X-Title': 'UGC Social Media'
		},
		body: JSON.stringify(body)
	});
	if (!res.ok) {
		const text = await res.text().catch(() => '');
		throw new OpenRouterError(
			`OpenRouter request failed: ${res.status} ${res.statusText} ${text.slice(0, 200)}`,
			res.status,
			'OPENROUTER_REQUEST_FAILED'
		);
	}
	const data = (await res.json()) as ChatCompletion;
	return data;
}

export { SYSTEM_PROMPT, SCHEMA_VERSION };
