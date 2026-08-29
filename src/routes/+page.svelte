<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Empty } from '$lib/components/ui/empty';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let posts = $derived(data.posts);

	function formatDate(ts: Date | number | null): string {
		if (!ts) return '-';
		const d = typeof ts === 'number' ? new Date(ts * 1000) : ts;
		return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
	}

	function platformColor(p: string): 'default' | 'secondary' | 'outline' {
		if (p === 'instagram') return 'default';
		if (p === 'facebook') return 'secondary';
		return 'outline';
	}
</script>

<svelte:head>
	<title>UGC Social Media — Civil Engineering Content</title>
</svelte:head>

<div class="mx-auto max-w-4xl px-6 py-16">
	<header class="mb-12 text-center">
		<h1 class="text-display text-foreground">Infografis Konstruksi</h1>
		<p class="text-text-secondary mt-3">
			Konten edukatif sipil, arsitektur, dan konstruksi — dibuat dengan riset.
		</p>
	</header>

	{#if posts.length === 0}
		<Empty>
			<p class="text-text-muted text-caption">Belum ada post dipublikasikan.</p>
		</Empty>
	{:else}
		<div class="grid gap-4">
			{#each posts as post (post.id)}
				<a href={`/post/${post.id}`} class="block">
					<Card.Root class="hover-lift transition-base">
						<Card.Content class="p-6">
							<div class="text-text-muted mb-2 flex items-center gap-2 font-mono text-xs">
								<span>#{post.id}</span>
								<span>·</span>
								<span>{formatDate(post.published_at ?? post.created_at)}</span>
							</div>
							<h2 class="text-h2 text-foreground mb-2 font-mono">{post.topic}</h2>
							{#if post.excerpt}
								<p class="text-text-secondary mb-4 line-clamp-2 text-sm">{post.excerpt}</p>
							{/if}
							<div class="flex flex-wrap items-center gap-2">
								<Badge variant={platformColor(post.platform)}>{post.platform}</Badge>
								<Badge variant="outline">{post.tone}</Badge>
								<Badge variant="outline">{post.slide_count} slides</Badge>
							</div>
						</Card.Content>
					</Card.Root>
				</a>
			{/each}
		</div>
	{/if}
</div>
