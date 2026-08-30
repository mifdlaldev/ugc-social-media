<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let posts = $derived(data.posts);
	let deleting = $state<string | null>(null);

	async function deletePost(id: string) {
		if (!confirm('Hapus post ini?')) return;
		deleting = id;
		try {
			const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
			if (res.ok) {
				posts = posts.filter((p) => p.id !== id);
			}
		} finally {
			deleting = null;
		}
	}

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
	<title>Workspace Owner</title>
</svelte:head>

<div class="mx-auto max-w-5xl px-6 py-12">
	<header class="mb-10 flex items-end justify-between gap-4">
		<div>
			<h1 class="text-display text-foreground">Workspace Owner</h1>
			<p class="text-text-secondary mt-2">Kelola post social media Anda.</p>
		</div>
		<div class="flex gap-2">
			<Button onclick={() => goto('/owner/new')}>
				<span class="font-mono">+</span>
				Post Baru
			</Button>
		</div>
	</header>

	{#if posts.length === 0}
		<Card.Root>
			<Card.Content class="py-16 text-center">
				<p class="text-text-muted text-caption">Belum ada post. Klik "+ Post Baru" untuk mulai.</p>
			</Card.Content>
		</Card.Root>
	{:else}
		<div class="grid gap-4">
			{#each posts as post (post.id)}
				<Card.Root class="hover-lift transition-base">
					<Card.Content class="p-6">
						<div class="flex items-start justify-between gap-4">
							<div class="min-w-0 flex-1">
								<div class="text-text-muted mb-2 flex items-center gap-2 font-mono text-xs">
									<span>#{post.id}</span>
									<span>·</span>
									<span>{formatDate(post.created_at)}</span>
								</div>
								<h3 class="text-h3 text-foreground mb-2 truncate font-mono">{post.topic}</h3>
								<div class="text-text-secondary mb-3 line-clamp-2 text-sm">
									{post.excerpt ?? '—'}
								</div>
								<div class="flex flex-wrap items-center gap-2">
									<Badge variant={platformColor(post.platform)}>{post.platform}</Badge>
									<Badge variant="outline">{post.tone}</Badge>
									<Badge variant="outline">{post.slide_count} slides</Badge>
								</div>
							</div>
							<div class="flex flex-col gap-2">
								<Button size="sm" onclick={() => goto(`/owner/generate/${post.id}`)}>Prompt</Button>
								<Button variant="outline" size="sm" onclick={() => goto(`/owner/edit/${post.id}`)}>
									Edit
								</Button>
								<Button
									variant="ghost"
									size="sm"
									disabled={deleting === post.id}
									onclick={() => deletePost(post.id)}
								>
									{deleting === post.id ? '...' : 'Hapus'}
								</Button>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{/if}
</div>
