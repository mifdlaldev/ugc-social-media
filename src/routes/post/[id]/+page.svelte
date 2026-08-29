<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Empty } from '$lib/components/ui/empty';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let post = $derived(data.post);
	let sources = $derived(data.sources);

	function formatDate(ts: Date | number | null): string {
		if (!ts) return '-';
		const d = typeof ts === 'number' ? new Date(ts * 1000) : ts;
		return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
	}

	function platformColor(p: string): 'default' | 'secondary' | 'outline' {
		if (p === 'instagram') return 'default';
		if (p === 'facebook') return 'secondary';
		return 'outline';
	}
</script>

<svelte:head>
	<title>{post.topic} — UGC Social Media</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-6 py-16">
	<a href="/" class="text-accent text-sm hover:underline mb-8 inline-block">← Kembali ke feed</a>

	<header class="mb-10">
		<div class="text-text-muted mb-3 flex items-center gap-2 font-mono text-xs">
			<span>#{post.id}</span>
			<span>·</span>
			<span>{formatDate(post.published_at ?? post.created_at)}</span>
		</div>
		<h1 class="text-display text-foreground mb-4 font-mono">{post.topic}</h1>
		{#if post.excerpt}
			<p class="text-text-secondary text-h3 leading-relaxed">{post.excerpt}</p>
		{/if}
		<div class="mt-4 flex flex-wrap items-center gap-2">
			<Badge variant={platformColor(post.platform)}>{post.platform}</Badge>
			<Badge variant="outline">{post.tone}</Badge>
			<Badge variant="outline">{post.slide_count} slides</Badge>
		</div>
	</header>

	<section class="mb-10">
		<h2 class="text-h2 text-foreground mb-4">Sumber Riset</h2>
		{#if sources.length === 0}
			<Empty>
				<p class="text-text-muted text-caption">Tidak ada sumber riset.</p>
			</Empty>
		{:else}
			<div class="grid gap-3">
				{#each sources as source (source.id)}
					<Card.Root class="hover-lift transition-base">
						<Card.Content class="p-5">
							<h3 class="text-h3 text-foreground mb-2 line-clamp-1">
								{source.source_title ?? 'Tanpa judul'}
							</h3>
							<p class="text-text-secondary mb-3 text-sm">
								{source.source_snippet ?? ''}
							</p>
							<a
								href={source.source_url}
								target="_blank"
								rel="noopener noreferrer"
								class="text-accent font-mono text-xs hover:underline"
							>
								{source.source_url}
							</a>
						</Card.Content>
					</Card.Root>
				{/each}
			</div>
		{/if}
	</section>
</div>
