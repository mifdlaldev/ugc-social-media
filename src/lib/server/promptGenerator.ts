import { createHash } from 'node:crypto';
import { eq, lt } from 'drizzle-orm';
import { db } from './db';
import { generation_attempts } from '../../../drizzle/schema';
import { chatCompletion } from './openRouterClient';
import { parsePromptOutput } from './promptParser';
import { checkFactFidelity } from './factFidelityGuard';
import type { PromptGenerationResult } from './promptSchema';

const RETENTION_DAYS = 90;

export type GenerationOutcome =
	| { status: 'success'; result: PromptGenerationResult; attemptId: number }
	| { status: 'failed'; reason: string; code: string; attemptId: number }
	| { status: 'invalid'; reason: string; code: string; attemptId: number }
	| { status: 'fidelity_rejected'; reason: string; rejectedTokens: string[]; attemptId: number };

export type GenerationRequest = {
	postId: number;
	presetId: number;
	article: string;
	title: string;
	presetSnapshot: Record<string, unknown>;
};

export async function generatePrompt(req: GenerationRequest): Promise<GenerationOutcome> {
	const inputHash = sha256(
		req.title + '\n' + req.article + '\n' + JSON.stringify(req.presetSnapshot)
	);
	const modelId = process.env.OPENROUTER_MODEL ?? 'openrouter/auto';

	const [attempt] = await db
		.insert(generation_attempts)
		.values({
			post_id: req.postId,
			preset_id: req.presetId,
			input_hash: inputHash,
			model_id: modelId,
			preset_snapshot: req.presetSnapshot,
			raw_output: null,
			parsed_result: null,
			status: 'failed',
			error_code: 'pending',
			error_message: null
		})
		.returning();
	if (!attempt) throw new Error('Failed to insert generation attempt');

	const userPrompt = buildUserPrompt(req);

	try {
		const completion = await chatCompletion(
			[
				{ role: 'system', content: SYSTEM_PROMPT_FACT_FIDELITY },
				{ role: 'user', content: userPrompt }
			],
			{ temperature: 0.4, maxTokens: 2500 }
		);
		const raw = completion.choices[0]?.message.content ?? '';
		await db
			.update(generation_attempts)
			.set({ raw_output: raw })
			.where(eq(generation_attempts.id, attempt.id));

		const parsed = parsePromptOutput(raw);
		if (!parsed.ok) {
			await finalizeAttempt(attempt.id, 'invalid', parsed.error, 'PARSE_OR_VALIDATION_FAILED');
			return {
				status: 'invalid',
				reason: parsed.error,
				code: 'PARSE_OR_VALIDATION_FAILED',
				attemptId: attempt.id
			};
		}

		const fidelity = checkFactFidelity(req.article, {
			sourceSummary: parsed.result.sourceSummary,
			blocks: Object.fromEntries(
				Object.entries(parsed.result.blocks).map(([k, v]) => [
					k,
					{ content: 'content' in v ? v.content : '' }
				])
			)
		});
		if (!fidelity.ok) {
			await finalizeAttempt(
				attempt.id,
				'fidelity_rejected',
				`rejected tokens: ${fidelity.rejectedTokens.join(', ')}`,
				'FIDELITY_REJECTED'
			);
			return {
				status: 'fidelity_rejected',
				reason: 'Generated content introduced tokens not present in the article',
				rejectedTokens: fidelity.rejectedTokens,
				attemptId: attempt.id
			};
		}

		await db
			.update(generation_attempts)
			.set({
				parsed_result: parsed.result,
				status: 'success',
				error_code: null,
				error_message: null
			})
			.where(eq(generation_attempts.id, attempt.id));
		return { status: 'success', result: parsed.result, attemptId: attempt.id };
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Unknown error';
		const code =
			err instanceof Error && 'code' in err
				? String((err as { code?: unknown }).code)
				: 'GENERATION_FAILED';
		await finalizeAttempt(attempt.id, 'failed', message, code);
		return { status: 'failed', reason: message, code, attemptId: attempt.id };
	}
}

async function finalizeAttempt(
	id: number,
	status: 'success' | 'failed' | 'invalid' | 'fidelity_rejected',
	errorMessage: string,
	errorCode: string
) {
	await db
		.update(generation_attempts)
		.set({ status, error_message: errorMessage, error_code: errorCode })
		.where(eq(generation_attempts.id, id));
}

function sha256(input: string): string {
	return createHash('sha256').update(input).digest('hex');
}

function buildUserPrompt(req: GenerationRequest): string {
	const presetLines = Object.entries(req.presetSnapshot)
		.filter(([, v]) => v !== null && v !== undefined)
		.map(([k, v]) => `- ${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`)
		.join('\n');
	return [
		`Article title: ${req.title}`,
		'',
		'Selected prompt preset (steers visual direction; must NOT inject facts):',
		presetLines,
		'',
		'Article (source of all factual content):',
		'"""',
		req.article,
		'"""',
		'',
		'Return JSON only, matching the schemaVersion in the system message.'
	].join('\n');
}

// Re-export the system prompt verbatim to avoid bundling cycle.
const SYSTEM_PROMPT_FACT_FIDELITY = [
	'You are a prompt engineer for an architect / civil-engineering educator.',
	'Convert the user-supplied article into STRUCTURED prompt blocks for an external image generator.',
	'',
	'HARD RULES:',
	'1. Every factual claim, number, material, dimension, named method, engineering term, and quantitative statement in the output MUST be traceable to the article. NO EXCEPTIONS.',
	'2. You may NOT inject facts from web search, model memory, training data, or any source other than the supplied article.',
	'3. If the article does not specify something, write "unspecified" in that block — never invent.',
	'4. Creative direction (style, palette, layout) is allowed and encouraged, but must not introduce factual engineering claims.',
	'5. "toolNotes" entries may explain format / syntax differences for image generators, but must not add facts.',
	'6. "fidelityNotes" lists items that were omitted or marked unspecified.',
	'',
	'OUTPUT: return a single JSON object matching schemaVersion "1.0.0" with this shape:',
	'  { "schemaVersion": "1.0.0", "sourceSummary": string, "blocks": { "visualStyle", "composition", "colorPalette", "typography", "layout", "onImageText", "aspectRatio", "toolNotes": [ ... ] }, "fidelityNotes": string[] }',
	'',
	'Reply with JSON only. No prose, no markdown fence.'
].join('\n');

export async function cleanupOldAttempts(): Promise<number> {
	const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
	const deleted = await db
		.delete(generation_attempts)
		.where(lt(generation_attempts.created_at, cutoff))
		.returning();
	return deleted.length;
}
