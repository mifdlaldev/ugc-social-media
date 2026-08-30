<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Select from '$lib/components/ui/select';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	type Post = PageData['posts'][number];

	let localPosts = $state<Post[] | null>(null);
	let posts = $derived(localPosts ?? data.posts);
	let deleting = $state<string | null>(null);
	let updating = $state<string | null>(null);

	let statusTab = $state<'all' | 'draft' | 'posted'>('all');
	let dateFilter = $state<'all' | 'today' | 'yesterday' | 'week' | 'month'>('all');

	const statusTabs = [
		{ id: 'all', label: 'Semua' },
		{ id: 'draft', label: 'Draft' },
		{ id: 'posted', label: 'Sudah Diposting' }
	] as const;

	const dateOptions = [
		{ value: 'all', label: 'Semua tanggal' },
		{ value: 'today', label: 'Hari ini' },
		{ value: 'yesterday', label: 'Kemarin' },
		{ value: 'week', label: '7 hari terakhir' },
		{ value: 'month', label: '30 hari terakhir' }
	] as const;

	/**
	 * Timestamps arrive as Date from the SvelteKit load, but as an ISO string
	 * from JSON API responses. Normalise both, plus the unix-seconds case.
	 */
	function toDate(ts: Date | number | string | null): Date | null {
		if (ts === null || ts === undefined) return null;
		if (ts instanceof Date) return ts;
		if (typeof ts === 'number') return new Date(ts * 1000);
		const parsed = new Date(ts);
		return Number.isNaN(parsed.getTime()) ? null : parsed;
	}

	function startOfDay(d: Date): number {
		return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
	}

	function matchesDate(post: Post): boolean {
		if (dateFilter === 'all') return true;
		const created = toDate(post.created_at);
		if (!created) return false;
		const today = startOfDay(new Date());
		const day = 86_400_000;
		const createdDay = startOfDay(created);
		if (dateFilter === 'today') return createdDay === today;
		if (dateFilter === 'yesterday') return createdDay === today - day;
		if (dateFilter === 'week') return createdDay > today - 7 * day;
		return createdDay > today - 30 * day;
	}

	let visiblePosts = $derived(
		posts.filter((p) => (statusTab === 'all' || p.post_status === statusTab) && matchesDate(p))
	);

	let draftCount = $derived(posts.filter((p) => p.post_status === 'draft').length);
	let postedCount = $derived(posts.filter((p) => p.post_status === 'posted').length);

	function tabCount(id: string): number {
		if (id === 'draft') return draftCount;
		if (id === 'posted') return postedCount;
		return posts.length;
	}

	async function deletePost(id: string) {
		if (!confirm('Hapus post ini?')) return;
		deleting = id;
		try {
			const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
			if (res.ok) {
				localPosts = posts.filter((p) => p.id !== id);
			}
		} finally {
			deleting = null;
		}
	}

	async function toggleStatus(post: Post) {
		const next = post.post_status === 'posted' ? 'draft' : 'posted';
		updating = post.id;
		try {
			const res = await fetch(`/api/posts/${post.id}/status`, {
				method: 'PATCH',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ post_status: next })
			});
			if (res.ok) {
				const updated = (await res.json()) as Post;
				localPosts = posts.map((p) => (p.id === post.id ? updated : p));
			}
		} finally {
			updating = null;
		}
	}

	function formatDate(ts: Date | number | string | null): string {
		const d = toDate(ts);
		if (!d) return '-';
		return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
	}

	function platformColor(p: string): 'default' | 'secondary' | 'outline' {
		if (p === 'instagram') return 'default';
		if (p === 'facebook') return 'secondary';
		return 'outline';
	}

	function shortId(id: string): string {
		return id.slice(0, 8);
	}
</script>

<svelte:head>
	<title>Workspace Owner</title>
</svelte:head>

<div class="mx-auto max-w-5xl px-6 py-12">
	<header class="mb-8 flex items-end justify-between gap-4">
		<div>
			<h1 class="text-display text-foreground">Workspace Owner</h1>
			<p class="text-text-secondary mt-2">Kelola post social media Anda.</p>
		</div>
		<Button onclick={() => goto('/owner/new')}>
			<span class="font-mono">+</span>
			Post Baru
		</Button>
	</header>

	<div class="border-border mb-6 flex flex-wrap items-center justify-between gap-4 border-b pb-4">
		<div class="flex gap-1">
			{#each statusTabs as tab (tab.id)}
				<Button
					variant={statusTab === tab.id ? 'default' : 'ghost'}
					size="sm"
					onclick={() => (statusTab = tab.id)}
				>
					{tab.label}
					<span class="ml-1 font-mono text-xs opacity-70">{tabCount(tab.id)}</span>
				</Button>
			{/each}
		</div>

		<div class="w-48">
			<Select.Root type="single" bind:value={dateFilter}>
				<Select.Trigger>
					{dateOptions.find((o) => o.value === dateFilter)?.label ?? 'Semua tanggal'}
				</Select.Trigger>
				<Select.Content>
					{#each dateOptions as option (option.value)}
						<Select.Item value={option.value} label={option.label} />
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
	</div>

	{#if posts.length === 0}
		<Card.Root>
			<Card.Content class="py-16 text-center">
				<p class="text-text-muted text-caption">Belum ada post. Klik "+ Post Baru" untuk mulai.</p>
			</Card.Content>
		</Card.Root>
	{:else if visiblePosts.length === 0}
		<Card.Root>
			<Card.Content class="py-16 text-center">
				<p class="text-text-muted text-caption">Tidak ada post yang cocok dengan filter ini.</p>
			</Card.Content>
		</Card.Root>
	{:else}
		<div class="grid gap-4">
			{#each visiblePosts as post (post.id)}
				<Card.Root class="hover-lift transition-base">
					<Card.Content class="p-6">
						<div class="flex items-start justify-between gap-4">
							<div class="min-w-0 flex-1">
								<div class="text-text-muted mb-2 flex items-center gap-2 font-mono text-xs">
									<span>{shortId(post.id)}</span>
									<span>·</span>
									<span>{formatDate(post.created_at)}</span>
								</div>
								<h3 class="text-h3 text-foreground mb-2 truncate font-mono">{post.topic}</h3>
								<div class="text-text-secondary mb-3 line-clamp-2 text-sm">
									{post.excerpt ?? '—'}
								</div>
								<div class="flex flex-wrap items-center gap-2">
									<Badge variant={post.post_status === 'posted' ? 'default' : 'outline'}>
										{post.post_status === 'posted' ? 'Sudah diposting' : 'Draft'}
									</Badge>
									<Badge variant={platformColor(post.platform)}>{post.platform}</Badge>
									<Badge variant="outline">{post.tone}</Badge>
									<Badge variant="outline">{post.slide_count} slides</Badge>
									{#if post.posted_at}
										<span class="text-text-muted font-mono text-xs">
											diposting {formatDate(post.posted_at)}
										</span>
									{/if}
								</div>
							</div>
							<div class="flex flex-col gap-2">
								<Button size="sm" onclick={() => goto(`/owner/generate/${post.id}`)}>Prompt</Button>
								<Button
									variant="outline"
									size="sm"
									disabled={updating === post.id}
									onclick={() => toggleStatus(post)}
								>
									{#if updating === post.id}
										...
									{:else if post.post_status === 'posted'}
										Jadikan draft
									{:else}
										Tandai diposting
									{/if}
								</Button>
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
