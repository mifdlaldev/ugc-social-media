<script lang="ts">
	import type { PageProps } from './$types';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';

	let { data }: PageProps = $props();
	const posts = $derived(data.posts);
	const categories = $derived(data.categories);
	const activeCategory = $derived(data.activeCategory);

	let query = $state(activeCategory ?? '');
</script>

<svelte:head>
	<title>Beranda — UGC Edukasi Teknik & Arsitektur</title>
	<meta
		name="description"
		content="Artikel edukatif tentang teknik sipil, konstruksi, dan arsitektur."
	/>
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-8">
	<header class="mb-8">
		<h1 class="text-3xl font-bold tracking-tight">Edukasi Teknik & Arsitektur</h1>
		<p class="mt-2 text-muted-foreground">
			Artikel edukatif seputar teknik sipil, konstruksi, dan arsitektur — siap diubah menjadi
			infografis untuk media sosial.
		</p>
	</header>

	<div class="mb-6 flex flex-wrap gap-2">
		<a href="/">
			<Badge variant={query === '' ? 'default' : 'secondary'}>Semua</Badge>
		</a>
		{#each categories as category (category.slug)}
			<a href={`/?category=${category.slug}`}>
				<Badge variant={query === category.slug ? 'default' : 'secondary'}>
					{category.name}
				</Badge>
			</a>
		{/each}
	</div>

	<div class="flex flex-col gap-4">
		{#each posts as post (post.id)}
			<Card.Root>
				<Card.Header>
					<div class="flex flex-wrap items-center gap-2">
						{#each post.categories as cat (cat.id)}
							<Badge variant="secondary">{cat.name}</Badge>
						{/each}
						{#if post.status === 'draft'}
							<Badge variant="destructive">Draft</Badge>
						{/if}
					</div>
					<Card.Title>
						<a href={`/post/${post.slug}`} class="hover:underline">{post.title}</a>
					</Card.Title>
					{#if post.excerpt}
						<Card.Description>{post.excerpt}</Card.Description>
					{/if}
				</Card.Header>
				<Card.Footer class="text-sm text-muted-foreground">
					<span
						>Dipublikasikan: {post.published_at
							? new Date(post.published_at).toLocaleDateString('id-ID')
							: '-'}</span
					>
				</Card.Footer>
			</Card.Root>
		{:else}
			<p class="text-muted-foreground">Belum ada artikel dipublikasikan.</p>
		{/each}
	</div>

	<div class="mt-10 border-t pt-6">
		<a href="/owner">
			<Button variant="outline">Workspace Owner</Button>
		</a>
	</div>
</div>
