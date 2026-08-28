import { desc, eq, inArray } from 'drizzle-orm';
import { db } from './db';
import { categories, post_categories, post_tags, posts, tags } from '../../../drizzle/schema';

export const INITIAL_CATEGORIES = [
	{ name: 'Struktur & Statika', slug: 'struktur-statika' },
	{ name: 'Arsitektur & Desain', slug: 'arsitektur-desain' },
	{ name: 'Material & Konstruksi', slug: 'material-konstruksi' },
	{ name: 'Infrastruktur & Transportasi', slug: 'infrastruktur-transportasi' },
	{ name: 'MEP & Utilitas', slug: 'mep-utilitas' },
	{ name: 'Tips & Tools Praktis', slug: 'tips-tools-praktis' }
] as const;

export async function listCategories() {
	return db.select().from(categories).orderBy(categories.name);
}

export async function listTags() {
	return db.select().from(tags).orderBy(tags.name);
}

export type PostWithRelations = typeof posts.$inferSelect & {
	categories: { id: number; name: string; slug: string }[];
	tags: { id: number; name: string; slug: string }[];
};

export async function listPublishedPosts(filter?: { categorySlug?: string; tagSlug?: string }) {
	if (filter?.categorySlug) {
		const rows = await db
			.select({ post: posts })
			.from(posts)
			.innerJoin(post_categories, eq(post_categories.post_id, posts.id))
			.innerJoin(categories, eq(categories.id, post_categories.category_id))
			.where(eq(categories.slug, filter.categorySlug))
			.orderBy(desc(posts.published_at ?? posts.created_at));
		return attachRelations(rows.map((r) => r.post));
	}
	if (filter?.tagSlug) {
		const rows = await db
			.select({ post: posts })
			.from(posts)
			.innerJoin(post_tags, eq(post_tags.post_id, posts.id))
			.innerJoin(tags, eq(tags.id, post_tags.tag_id))
			.where(eq(tags.slug, filter.tagSlug))
			.orderBy(desc(posts.published_at ?? posts.created_at));
		return attachRelations(rows.map((r) => r.post));
	}
	const rows = await db
		.select()
		.from(posts)
		.orderBy(desc(posts.published_at ?? posts.created_at));
	return attachRelations(rows);
}

export async function getPublishedPostBySlug(slug: string): Promise<PostWithRelations | null> {
	const [row] = await db.select().from(posts).where(eq(posts.slug, slug));
	if (!row || row.status !== 'published') return null;
	const [withRelations] = await attachRelations([row]);
	return withRelations ?? null;
}

export async function getOwnerPostById(id: number): Promise<PostWithRelations | null> {
	const [row] = await db.select().from(posts).where(eq(posts.id, id));
	if (!row) return null;
	const [withRelations] = await attachRelations([row]);
	return withRelations ?? null;
}

export async function listAllPosts() {
	const rows = await db.select().from(posts).orderBy(desc(posts.updated_at));
	return attachRelations(rows);
}

async function attachRelations(
	postRows: (typeof posts.$inferSelect)[]
): Promise<PostWithRelations[]> {
	if (postRows.length === 0) return [];
	const ids = postRows.map((p) => p.id);
	const catRows = await db
		.select({
			postId: post_categories.post_id,
			id: categories.id,
			name: categories.name,
			slug: categories.slug
		})
		.from(post_categories)
		.innerJoin(categories, eq(categories.id, post_categories.category_id))
		.where(inArray(post_categories.post_id, ids));
	const tagRows = await db
		.select({
			postId: post_tags.post_id,
			id: tags.id,
			name: tags.name,
			slug: tags.slug
		})
		.from(post_tags)
		.innerJoin(tags, eq(tags.id, post_tags.tag_id))
		.where(inArray(post_tags.post_id, ids));
	return postRows.map((p) => ({
		...p,
		categories: catRows
			.filter((c) => c.postId === p.id)
			.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
		tags: tagRows
			.filter((t) => t.postId === p.id)
			.map((t) => ({ id: t.id, name: t.name, slug: t.slug }))
	}));
}
