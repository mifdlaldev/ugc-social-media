<script lang="ts">
	import type { PageProps } from './$types';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';

	let { data }: PageProps = $props();
	const post = $derived(data.post);
</script>

<svelte:head>
	<title>{post?.title ?? 'Artikel'}</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-8">
	{#if post}
		<div class="mb-6 flex flex-wrap gap-2">
			{#each post.categories as cat (cat.id)}
				<Badge variant="secondary">{cat.name}</Badge>
			{/each}
			{#each post.tags as tag (tag.id)}
				<Badge variant="outline">#{tag.name}</Badge>
			{/each}
		</div>

		<Card.Root>
			<Card.Header>
				<Card.Title class="text-2xl">{post.title}</Card.Title>
				<Card.Description>
					Diperbarui: {new Date(post.updated_at).toLocaleDateString('id-ID')}
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="prose max-w-none prose-neutral dark:prose-invert">
					{post.article_body}
				</div>
			</Card.Content>
		</Card.Root>

		<div class="mt-8 flex items-center justify-between">
			<a href="/">
				<Button variant="outline">← Kembali ke beranda</Button>
			</a>
			<a href="/owner">
				<Button>Kelola Artikel</Button>
			</a>
		</div>
	{:else}
		<div class="text-center">
			<h1 class="text-2xl font-bold">Artikel tidak ditemukan</h1>
			<p class="mt-2 text-muted-foreground">Artikel ini belum dipublikasikan atau sudah dihapus.</p>
			<div class="mt-6">
				<a href="/">
					<Button variant="outline">← Kembali ke beranda</Button>
				</a>
			</div>
		</div>
	{/if}
</div>
