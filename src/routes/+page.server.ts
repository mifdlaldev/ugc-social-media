import type { PageServerLoad } from './$types';
import { listCategories, listPublishedPosts } from '$lib/server/posts';

export const load: PageServerLoad = async ({ url }) => {
	const category = url.searchParams.get('category') ?? undefined;
	const tag = url.searchParams.get('tag') ?? undefined;
	const [posts, categories] = await Promise.all([
		listPublishedPosts({ categorySlug: category, tagSlug: tag }),
		listCategories()
	]);
	return { posts, categories, activeCategory: category, activeTag: tag };
};
