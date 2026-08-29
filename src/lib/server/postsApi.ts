import { Elysia, t } from 'elysia';
import { eq, sql } from 'drizzle-orm';
import { requireOwner } from './auth';
import { db } from './db';
import { posts, post_research_sources } from '../../../drizzle/schema';
import { getOwnerPostById, getPublishedPostById, listAllPosts, listPublishedPosts } from './posts';
import { compileResearch } from './researchService';

const postBody = t.Object({
	topic: t.String({ minLength: 1, maxLength: 200 }),
	platform: t.Optional(
		t.Enum({ instagram: 'instagram', facebook: 'facebook', linkedin: 'linkedin' })
	),
	tone: t.Optional(
		t.Enum({
			detail: 'detail',
			observatif: 'observatif',
			informatif: 'informatif',
			menjual: 'menjual',
			creative: 'creative'
		})
	),
	slide_count: t.Optional(t.Integer({ minimum: 3, maximum: 7 })),
	excerpt: t.Optional(t.String({ maxLength: 300 })),
	status: t.Optional(t.Enum({ draft: 'draft', published: 'published' }))
});

export const postsApi = new Elysia({ prefix: '/api' })
	.get('/feed', async ({ set }) => {
		set.status = 200;
		return await listPublishedPosts();
	})
	.get('/posts/:id', async ({ params, set }) => {
		const post = await getPublishedPostById(Number(params.id));
		if (!post) {
			set.status = 404;
			return { error: 'Post not found' };
		}
		set.status = 200;
		return post;
	})
	.get('/posts', async ({ request, set }) => {
		await requireOwner(request);
		set.status = 200;
		return await listAllPosts();
	})
	.post(
		'/posts',
		async ({ request, body, set }) => {
			await requireOwner(request);
			const inserted = await db
				.insert(posts)
				.values({
					author_id: 1,
					topic: body.topic,
					platform: body.platform ?? 'instagram',
					tone: body.tone ?? 'informatif',
					slide_count: body.slide_count ?? 5,
					excerpt: body.excerpt ?? null,
					status: body.status ?? 'draft'
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
			const existing = await getOwnerPostById(Number(params.id));
			if (!existing) {
				set.status = 404;
				return { error: 'Post not found' };
			}
			const updated = await db
				.update(posts)
				.set({
					topic: body.topic ?? existing.topic,
					platform: body.platform ?? existing.platform,
					tone: body.tone ?? existing.tone,
					slide_count: body.slide_count ?? existing.slide_count,
					excerpt: body.excerpt !== undefined ? body.excerpt : existing.excerpt,
					status: body.status ?? existing.status,
					published_at:
						body.status === 'published' && existing.published_at === null
							? sql`(unixepoch())`
							: existing.published_at
				})
				.where(eq(posts.id, existing.id))
				.returning();
			set.status = 200;
			return updated[0];
		},
		{
			body: t.Object({
				topic: t.Optional(t.String({ minLength: 1, maxLength: 200 })),
				platform: t.Optional(
					t.Enum({ instagram: 'instagram', facebook: 'facebook', linkedin: 'linkedin' })
				),
				tone: t.Optional(
					t.Enum({
						detail: 'detail',
						observatif: 'observatif',
						informatif: 'informatif',
						menjual: 'menjual',
						creative: 'creative'
					})
				),
				slide_count: t.Optional(t.Integer({ minimum: 3, maximum: 7 })),
				excerpt: t.Optional(t.String({ maxLength: 300 })),
				status: t.Optional(t.Enum({ draft: 'draft', published: 'published' }))
			})
		}
	)
	.delete('/posts/:id', async ({ request, params, set }) => {
		await requireOwner(request);
		const existing = await getOwnerPostById(Number(params.id));
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
		const post = await getOwnerPostById(Number(params.id));
		if (!post) {
			set.status = 404;
			return { success: false, error: 'Post not found' };
		}
		try {
			const research = await compileResearch(post.topic);
			await db
				.delete(post_research_sources)
				.where(eq(post_research_sources.post_id, post.id));
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
		const post = await getOwnerPostById(Number(params.id));
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
	});
