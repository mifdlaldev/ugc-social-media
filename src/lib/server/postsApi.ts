import { Elysia, t } from 'elysia';
import { eq, inArray } from 'drizzle-orm';
import { requireOwner } from './auth';
import { db } from './db';
import {
	generation_attempts,
	post_research_sources,
	prompt_slides,
	provider_variants,
	posts
} from '$lib/server/schema';
import { getOwnerId, getOwnerPostById, listAllPosts } from './posts';
import { compileResearch } from './researchService';
import { generateSlides } from './promptGenerator';
import {
	STYLE_LOCK_MAX_LENGTH,
	generateStyleLock,
	validateStyleLockText
} from './styleLockService';
import { config } from './config';
import { createHash } from 'node:crypto';
import { DEFAULT_VISUAL_COMMAND, VISUAL_COMMAND_VALUES } from '$lib/catalog/visualCommands';
import {
	DEFAULT_PLATFORM_PLACEMENT,
	PLATFORM_PLACEMENT_VALUES
} from '$lib/catalog/platformPlacements';

const visualCommandSchema = t.Union(VISUAL_COMMAND_VALUES.map((value) => t.Literal(value)));
const platformPlacementSchema = t.Union(PLATFORM_PLACEMENT_VALUES.map((value) => t.Literal(value)));

const postBody = t.Object({
	topic: t.String({ minLength: 1, maxLength: 200 }),
	platform_placement: t.Optional(platformPlacementSchema),
	visual_command: t.Optional(visualCommandSchema),
	slide_count: t.Optional(t.Integer({ minimum: 3, maximum: 7 })),
	excerpt: t.Optional(t.String({ maxLength: 300 }))
});

/** Numbered research brief, shared by the style-lock and generate routes. */
function buildResearchBrief(
	sources: { source_title: string | null; source_snippet: string | null; source_url: string }[]
): string {
	return sources
		.map(
			(s, i) =>
				`[${i + 1}] ${s.source_title ?? ''}\n${s.source_snippet ?? ''}\nURL: ${s.source_url}`
		)
		.join('\n\n');
}

export const postsApi = new Elysia({ prefix: '/api' })
	.get('/posts', async ({ request, set }) => {
		await requireOwner(request);
		set.status = 200;
		return await listAllPosts();
	})
	.post(
		'/posts',
		async ({ request, body, set }) => {
			await requireOwner(request);
			const ownerId = await getOwnerId();
			const inserted = await db
				.insert(posts)
				.values({
					author_id: ownerId,
					topic: body.topic,
					platform_placement: body.platform_placement ?? DEFAULT_PLATFORM_PLACEMENT,
					visual_command: body.visual_command ?? DEFAULT_VISUAL_COMMAND,
					slide_count: body.slide_count ?? 5,
					excerpt: body.excerpt ?? null
				})
				.returning();
			set.status = 201;
			return inserted[0];
		},
		{ body: postBody }
	)
	.put(
		'/posts/:id',
		async ({ request, params, body, set }) => {
			await requireOwner(request);
			const existing = await getOwnerPostById(params.id);
			if (!existing) {
				set.status = 404;
				return { error: 'Post not found' };
			}
			const updated = await db
				.update(posts)
				.set({
					topic: body.topic ?? existing.topic,
					platform_placement: body.platform_placement ?? existing.platform_placement,
					visual_command: body.visual_command ?? existing.visual_command,
					slide_count: body.slide_count ?? existing.slide_count,
					excerpt: body.excerpt !== undefined ? body.excerpt : existing.excerpt
				})
				.where(eq(posts.id, existing.id))
				.returning();
			set.status = 200;
			return updated[0];
		},
		{
			body: t.Object({
				topic: t.Optional(t.String({ minLength: 1, maxLength: 200 })),
				platform_placement: t.Optional(platformPlacementSchema),
				visual_command: t.Optional(visualCommandSchema),
				slide_count: t.Optional(t.Integer({ minimum: 3, maximum: 7 })),
				excerpt: t.Optional(t.String({ maxLength: 300 }))
			})
		}
	)
	.patch(
		'/posts/:id/status',
		async ({ request, params, body, set }) => {
			await requireOwner(request);
			const existing = await getOwnerPostById(params.id);
			if (!existing) {
				set.status = 404;
				return { error: 'Post not found' };
			}
			const updated = await db
				.update(posts)
				.set({
					post_status: body.post_status,
					posted_at: body.post_status === 'posted' ? new Date() : null
				})
				.where(eq(posts.id, existing.id))
				.returning();
			set.status = 200;
			return updated[0];
		},
		{
			body: t.Object({
				post_status: t.Enum({ draft: 'draft', posted: 'posted' })
			})
		}
	)
	.delete('/posts/:id', async ({ request, params, set }) => {
		await requireOwner(request);
		const existing = await getOwnerPostById(params.id);
		if (!existing) {
			set.status = 404;
			return { error: 'Post not found' };
		}
		await db.delete(posts).where(eq(posts.id, existing.id));
		set.status = 200;
		return { ok: true };
	})
	.post('/posts/:id/research', async ({ request, params, set }) => {
		await requireOwner(request);
		const post = await getOwnerPostById(params.id);
		if (!post) {
			set.status = 404;
			return { success: false, error: 'Post not found' };
		}
		try {
			const research = await compileResearch(post.topic);
			await db.delete(post_research_sources).where(eq(post_research_sources.post_id, post.id));
			for (const source of research.sources) {
				await db.insert(post_research_sources).values({
					post_id: post.id,
					source_url: source.url,
					source_title: source.title,
					source_snippet: source.snippet,
					source_engine: 'you.com',
					relevance_score: null
				});
			}
			set.status = 200;
			return { success: true, count: research.sources.length };
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Unknown error';
			set.status = 500;
			return { success: false, error: message };
		}
	})
	.post('/posts/:id/approve-research', async ({ request, params, set }) => {
		await requireOwner(request);
		const post = await getOwnerPostById(params.id);
		if (!post) {
			set.status = 404;
			return { ok: false, error: 'Post not found' };
		}
		const sources = await db
			.select()
			.from(post_research_sources)
			.where(eq(post_research_sources.post_id, post.id));
		if (sources.length === 0) {
			set.status = 400;
			return { ok: false, error: 'No research sources. Run research first.' };
		}
		set.status = 200;
		return { ok: true };
	})
	.get('/posts/:id/style-lock', async ({ request, params, set }) => {
		await requireOwner(request);
		const post = await getOwnerPostById(params.id);
		if (!post) {
			set.status = 404;
			return { error: 'Post not found' };
		}
		set.status = 200;
		return {
			style_lock: post.style_lock,
			has_style_lock: (post.style_lock ?? '').trim().length > 0
		};
	})
	.post('/posts/:id/style-lock', async ({ request, params, set }) => {
		await requireOwner(request);
		const post = await getOwnerPostById(params.id);
		if (!post) {
			set.status = 404;
			return { success: false, error: 'Post not found' };
		}
		const sources = await db
			.select()
			.from(post_research_sources)
			.where(eq(post_research_sources.post_id, post.id));
		if (sources.length === 0) {
			set.status = 400;
			return { success: false, error: 'No research sources. Run and approve research first.' };
		}
		try {
			const result = await generateStyleLock(
				post.topic,
				buildResearchBrief(sources),
				post.platform_placement,
				post.visual_command
			);
			const [updated] = await db
				.update(posts)
				.set({ style_lock: result.style_lock })
				.where(eq(posts.id, post.id))
				.returning();
			set.status = 200;
			return { success: true, style_lock: updated?.style_lock ?? result.style_lock };
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Unknown error';
			set.status = 500;
			return { success: false, error: message };
		}
	})
	.put(
		'/posts/:id/style-lock',
		async ({ request, params, body, set }) => {
			await requireOwner(request);
			const post = await getOwnerPostById(params.id);
			if (!post) {
				set.status = 404;
				return { success: false, error: 'Post not found' };
			}
			try {
				// The owner's wording is authoritative; only bounds are enforced.
				const text = validateStyleLockText(body.style_lock);
				const [updated] = await db
					.update(posts)
					.set({ style_lock: text })
					.where(eq(posts.id, post.id))
					.returning();
				set.status = 200;
				return { success: true, style_lock: updated?.style_lock ?? text };
			} catch (err) {
				const message = err instanceof Error ? err.message : 'Unknown error';
				set.status = 422;
				return { success: false, error: message };
			}
		},
		{
			body: t.Object({
				style_lock: t.String({ minLength: 1, maxLength: STYLE_LOCK_MAX_LENGTH })
			})
		}
	)
	.post('/posts/:id/generate', async ({ request, params, set }) => {
		await requireOwner(request);
		const post = await getOwnerPostById(params.id);
		if (!post) {
			set.status = 404;
			return { success: false, error: 'Post not found' };
		}
		const sources = await db
			.select()
			.from(post_research_sources)
			.where(eq(post_research_sources.post_id, post.id));
		if (sources.length === 0) {
			set.status = 400;
			return { success: false, error: 'No research sources' };
		}
		const styleLock = (post.style_lock ?? '').trim();
		if (styleLock.length === 0) {
			set.status = 400;
			return {
				success: false,
				error: 'No style lock. Produce a style lock before generating slides.'
			};
		}
		const researchBrief = buildResearchBrief(sources);
		try {
			const result = await generateSlides(
				post.topic,
				researchBrief,
				post.platform_placement,
				post.visual_command,
				post.slide_count,
				styleLock
			);
			const oldSlides = await db
				.select({ id: prompt_slides.id })
				.from(prompt_slides)
				.where(eq(prompt_slides.post_id, post.id));
			if (oldSlides.length > 0) {
				const oldIds = oldSlides.map((s) => s.id);
				await db.delete(provider_variants).where(inArray(provider_variants.slide_id, oldIds));
			}
			await db.delete(prompt_slides).where(eq(prompt_slides.post_id, post.id));
			for (const slide of result.slides) {
				const [inserted] = await db
					.insert(prompt_slides)
					.values({
						post_id: post.id,
						slide_index: slide.slide_index,
						slide_type: slide.slide_type,
						slide_title: slide.slide_title,
						slide_subtitle: slide.slide_subtitle || null,
						slide_explanation: slide.slide_explanation,
						visual_labels: slide.visual_labels || null,
						slide_takeaway: slide.slide_takeaway || null,
						research_context: slide.research_context
					})
					.returning();
				if (!inserted) continue;
				for (const variant of slide.variants) {
					await db.insert(provider_variants).values({
						slide_id: inserted.id,
						provider: variant.provider,
						prompt_text: variant.prompt_text,
						visual_notes: variant.visual_notes,
						on_image_text: variant.on_image_text,
						aspect_ratio: variant.aspect_ratio
					});
				}
			}
			const inputHash = createHash('sha256')
				.update(post.topic + researchBrief)
				.digest('hex')
				.slice(0, 16);
			await db.insert(generation_attempts).values({
				post_id: post.id,
				input_hash: inputHash,
				model_id: config.openRouterModel,
				raw_output: JSON.stringify(result.synthesis),
				parsed_result: JSON.stringify(result.slides),
				status: 'success'
			});
			set.status = 200;
			return { success: true, slideCount: result.slides.length };
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Unknown error';
			set.status = 500;
			return { success: false, error: message };
		}
	})
	.get('/posts/:id/slides', async ({ params, set }) => {
		const postId = params.id;
		const slides = await db.select().from(prompt_slides).where(eq(prompt_slides.post_id, postId));
		if (slides.length === 0) {
			set.status = 200;
			return { slides: [], variants: [] };
		}
		const slideIds = slides.map((s) => s.id);
		const variants = await db
			.select()
			.from(provider_variants)
			.where(inArray(provider_variants.slide_id, slideIds));
		set.status = 200;
		return { slides, variants };
	});
