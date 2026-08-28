import { Elysia, t } from 'elysia';
import { eq, sql } from 'drizzle-orm';
import { requireOwner } from './auth';
import { db } from './db';
import { posts } from '../../../drizzle/schema';
import {
	getOwnerPostById,
	getPublishedPostBySlug,
	listAllPosts,
	listCategories,
	listPublishedPosts,
	listTags
} from './posts';

function slugify(input: string): string {
	return input
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/[\s_]+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}

const postBody = t.Object({
	title: t.String({ minLength: 1, maxLength: 200 }),
	article_body: t.String({ minLength: 1, maxLength: 10_000 }),
	excerpt: t.Optional(t.String({ maxLength: 500 })),
	slug: t.Optional(t.String({ maxLength: 200 })),
	status: t.Optional(t.Enum({ draft: 'draft', published: 'published' }))
});

export const postsApi = new Elysia({ prefix: '/api' })
	.get('/feed', async ({ query, set }) => {
		const result = await listPublishedPosts({
			categorySlug: query.category,
			tagSlug: query.tag
		});
		set.status = 200;
		return result;
	})
	.get('/posts/:slug', async ({ params, set }) => {
		const post = await getPublishedPostBySlug(params.slug);
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
			const slug = body.slug && body.slug.length > 0 ? body.slug : slugify(body.title);
			const inserted = await db
				.insert(posts)
				.values({
					author_id: 1,
					title: body.title,
					slug,
					article_body: body.article_body,
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
					title: body.title ?? existing.title,
					article_body: body.article_body ?? existing.article_body,
					excerpt: body.excerpt !== undefined ? body.excerpt : existing.excerpt,
					slug: body.slug && body.slug.length > 0 ? body.slug : existing.slug,
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
				title: t.Optional(t.String({ minLength: 1, maxLength: 200 })),
				article_body: t.Optional(t.String({ minLength: 1, maxLength: 10_000 })),
				excerpt: t.Optional(t.String({ maxLength: 500 })),
				slug: t.Optional(t.String({ maxLength: 200 })),
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
	.get('/categories', async ({ set }) => {
		set.status = 200;
		return await listCategories();
	})
	.get('/tags', async ({ set }) => {
		set.status = 200;
		return await listTags();
	});
