/**
 * End-to-end smoke test for the owner pipeline.
 *
 * Exercises the real Elysia app against the real local SQLite database, and makes
 * real OpenRouter and You.com calls. It is deliberately NOT part of `bun test`,
 * because it costs money and needs network access.
 *
 * Run:  bun run scripts/smoke-pipeline.ts
 *
 * It creates a post, runs research, approves it, generates slides, asserts the
 * placement canvas and visual command reached all three provider variants, then
 * deletes the post it created.
 */
import { readFileSync } from 'node:fs';

for (const line of readFileSync('.env.local', 'utf-8').split('\n')) {
	const m = line.match(/^([A-Z_]+)=(.*)$/);
	if (m?.[1] && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
}

const { api } = await import('../src/lib/server/api');
const { createSession } = await import('../src/lib/server/session');
const { config } = await import('../src/lib/server/config');
const { db } = await import('../src/lib/server/db');
const { posts, prompt_slides, provider_variants } = await import('../drizzle/schema');
const { findPlatformPlacement } = await import('../src/lib/catalog/platformPlacements');
const { eq, inArray } = await import('drizzle-orm');

const PLACEMENT = 'pinterest-standard-pin';
const COMMAND = '/comparison';
const SLIDES = 5;

let failures = 0;
function check(label: string, ok: boolean, detail = '') {
	console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
	if (!ok) failures++;
}

const { token } = await createSession(config.sessionSecret);
const headers = { 'content-type': 'application/json', cookie: `ugc_session=${token}` };
const call = (path: string, init: RequestInit = {}) =>
	api.handle(new Request(`http://localhost${path}`, { headers, ...init }));

let postId: string | null = null;

try {
	console.log('\n1. create post');
	const createRes = await call('/api/posts', {
		method: 'POST',
		body: JSON.stringify({
			topic: '[smoke] Bata merah vs bata ringan',
			platform_placement: PLACEMENT,
			visual_command: COMMAND,
			slide_count: SLIDES
		})
	});
	const created = (await createRes.json()) as Record<string, unknown>;
	check('create returns 201', createRes.status === 201, `status ${createRes.status}`);
	postId = typeof created.id === 'string' ? created.id : null;
	check('post has an id', postId !== null);
	check('placement stored', created.platform_placement === PLACEMENT, String(created.platform_placement));
	check('command stored', created.visual_command === COMMAND, String(created.visual_command));
	check('no legacy platform field', !('platform' in created));
	check('no legacy tone field', !('tone' in created));
	if (!postId) throw new Error('cannot continue without a post id');

	console.log('\n2. reject an out-of-catalog value');
	const badRes = await call('/api/posts', {
		method: 'POST',
		body: JSON.stringify({
			topic: '[smoke] rejected',
			platform_placement: 'tiktok-photo-post',
			visual_command: COMMAND
		})
	});
	check('excluded placement rejected', badRes.status >= 400, `status ${badRes.status}`);

	console.log('\n3. research via You.com');
	const researchRes = await call(`/api/posts/${postId}/research`, { method: 'POST' });
	const research = (await researchRes.json()) as { success?: boolean; count?: number; error?: string };
	check('research succeeded', researchRes.status === 200 && research.success === true, research.error ?? '');
	check('sources persisted', (research.count ?? 0) > 0, `${research.count} sources`);

	console.log('\n4. approve research');
	const approveRes = await call(`/api/posts/${postId}/approve-research`, { method: 'POST' });
	const approve = (await approveRes.json()) as { ok?: boolean; error?: string };
	check('approve succeeded', approveRes.status === 200 && approve.ok === true, approve.error ?? '');

	console.log('\n5. generate slides');
	const genRes = await call(`/api/posts/${postId}/generate`, { method: 'POST' });
	const gen = (await genRes.json()) as { success?: boolean; slideCount?: number; error?: string };
	check('generate succeeded', genRes.status === 200 && gen.success === true, gen.error ?? '');
	check('slide count matches request', gen.slideCount === SLIDES, `${gen.slideCount} slides`);

	console.log('\n6. inspect stored variants');
	const slides = await db.select().from(prompt_slides).where(eq(prompt_slides.post_id, postId));
	check('slides persisted', slides.length === SLIDES, `${slides.length} rows`);
	check('first slide is hook', slides.find((s) => s.slide_index === 0)?.slide_type === 'hook');
	check(
		'last slide is cta',
		slides.find((s) => s.slide_index === SLIDES - 1)?.slide_type === 'cta'
	);

	const variants = await db
		.select()
		.from(provider_variants)
		.where(
			inArray(
				provider_variants.slide_id,
				slides.map((s) => s.id)
			)
		);
	check('three variants per slide', variants.length === SLIDES * 3, `${variants.length} rows`);

	const placement = findPlatformPlacement(PLACEMENT)!;
	const canvas = `${placement.width}x${placement.height}`;
	check(
		'every variant states the exact canvas',
		variants.every((v) => v.prompt_text.includes(canvas)),
		canvas
	);
	check(
		'every variant states the ratio',
		variants.every((v) => v.prompt_text.includes(placement.ratio)),
		placement.ratio
	);
	check(
		'every variant names the visual command',
		variants.every((v) => v.prompt_text.includes(COMMAND))
	);
	check(
		'stored aspect_ratio matches the placement',
		variants.every((v) => v.aspect_ratio === placement.ratio)
	);

	const gptVariants = variants.filter((v) => v.provider === 'gpt-image');
	check(
		'gpt-image variant exists per slide',
		gptVariants.length === SLIDES,
		`${gptVariants.length} rows`
	);
	// Not yet implemented (per-post-style-lock task 5.2). Reported, not asserted.
	const leading = gptVariants.filter((v) => v.prompt_text.startsWith(COMMAND)).length;
	console.log(
		`INFO  gpt-image prompts starting with "${COMMAND}": ${leading}/${gptVariants.length} (task 5.2 pending)`
	);

	console.log('\n--- sample gpt-image prompt (slide 1) ---');
	console.log(gptVariants.find((v) => v.slide_id === slides.find((s) => s.slide_index === 0)?.id)?.prompt_text);
} finally {
	if (postId) {
		await db.delete(posts).where(eq(posts.id, postId));
		console.log('\ncleanup: smoke post deleted');
	}
}

console.log(`\n${failures === 0 ? 'ALL CHECKS PASSED' : `${failures} CHECK(S) FAILED`}`);
process.exit(failures === 0 ? 0 : 1);
