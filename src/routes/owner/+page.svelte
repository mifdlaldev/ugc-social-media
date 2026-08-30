<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Select from '$lib/components/ui/select';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { goto } from '$app/navigation';
	import { findPlatformPlacement } from '$lib/catalog/platformPlacements';
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

	let pageSize = $state('20');
	let page = $state(1);

	const pageSizeOptions = [
		{ value: '10', label: '10 per halaman' },
		{ value: '20', label: '20 per halaman' },
		{ value: '50', label: '50 per halaman' },
		{ value: '100', label: '100 per halaman' }
	] as const;

	let perPage = $derived(Number(pageSize));
	let totalPages = $derived(Math.max(1, Math.ceil(visiblePosts.length / perPage)));
	let currentPage = $derived(Math.min(page, totalPages));
	let pagedPosts = $derived(visiblePosts.slice((currentPage - 1) * perPage, currentPage * perPage));
	let rangeStart = $derived(visiblePosts.length === 0 ? 0 : (currentPage - 1) * perPage + 1);
	let rangeEnd = $derived(Math.min(currentPage * perPage, visiblePosts.length));

	/** Any filter or page-size change should send the user back to the first page. */
	function resetPage() {
		page = 1;
	}

	let draftCount = $derived(posts.filter((p) => p.post_status === 'draft').length);
	let postedCount = $derived(posts.filter((p) => p.post_status === 'posted').length);

	function tabCount(id: string): number {
		if (id === 'draft') return draftCount;
		if (id === 'posted') return postedCount;
		return posts.length;
	}

	let pendingDelete = $state<Post | null>(null);

	async function confirmDelete() {
		const target = pendingDelete;
		if (!target) return;
		deleting = target.id;
		try {
			const res = await fetch(`/api/posts/${target.id}`, { method: 'DELETE' });
			if (res.ok) {
				localPosts = posts.filter((p) => p.id !== target.id);
			}
		} finally {
			deleting = null;
			pendingDelete = null;
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

	/** Compact placement label for the list: platform plus exact canvas. */
	function placementBadge(value: string): string {
		const placement = findPlatformPlacement(value);
		if (!placement) return value;
		return `${placement.platform} ${placement.width}×${placement.height}`;
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
			<p class="mt-2 text-text-secondary">Kelola post social media Anda.</p>
		</div>
		<Button onclick={() => goto('/owner/new')}>
			<span class="font-mono">+</span>
			Post Baru
		</Button>
	</header>

	<div class="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
		<div class="flex gap-1">
			{#each statusTabs as tab (tab.id)}
				<Button
					variant={statusTab === tab.id ? 'default' : 'ghost'}
					size="sm"
					onclick={() => {
						statusTab = tab.id;
						resetPage();
					}}
				>
					{tab.label}
					<span class="ml-1 font-mono text-xs opacity-70">{tabCount(tab.id)}</span>
				</Button>
			{/each}
		</div>

		<div class="w-48">
			<Select.Root type="single" bind:value={dateFilter} onValueChange={resetPage}>
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
				<p class="text-caption text-text-muted">Belum ada post. Klik "+ Post Baru" untuk mulai.</p>
			</Card.Content>
		</Card.Root>
	{:else if visiblePosts.length === 0}
		<Card.Root>
			<Card.Content class="py-16 text-center">
				<p class="text-caption text-text-muted">Tidak ada post yang cocok dengan filter ini.</p>
			</Card.Content>
		</Card.Root>
	{:else}
		<div class="grid gap-4">
			{#each pagedPosts as post (post.id)}
				<Card.Root class="hover-lift transition-base">
					<Card.Content class="p-6">
						<div class="flex items-start justify-between gap-4">
							<div class="min-w-0 flex-1">
								<div class="mb-2 flex items-center gap-2 font-mono text-xs text-text-muted">
									<span>{shortId(post.id)}</span>
									<span>·</span>
									<span>{formatDate(post.created_at)}</span>
								</div>
								<h3 class="text-h3 mb-2 truncate font-mono text-foreground">{post.topic}</h3>
								<div class="mb-3 line-clamp-2 text-sm text-text-secondary">
									{post.excerpt ?? '—'}
								</div>
								<div class="flex flex-wrap items-center gap-2">
									<Badge variant={post.post_status === 'posted' ? 'default' : 'outline'}>
										{post.post_status === 'posted' ? 'Sudah diposting' : 'Draft'}
									</Badge>
									<Badge variant="secondary">{placementBadge(post.platform_placement)}</Badge>
									<Badge variant="outline" class="font-mono">{post.visual_command}</Badge>
									<Badge variant="outline">{post.slide_count} slides</Badge>
									{#if post.posted_at}
										<span class="font-mono text-xs text-text-muted">
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
									onclick={() => (pendingDelete = post)}
								>
									{deleting === post.id ? '...' : 'Hapus'}
								</Button>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>

		<div class="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
			<p class="font-mono text-xs text-text-muted">
				{rangeStart}–{rangeEnd} dari {visiblePosts.length} post
			</p>

			<div class="flex items-center gap-4">
				<div class="w-44">
					<Select.Root type="single" bind:value={pageSize} onValueChange={resetPage}>
						<Select.Trigger>
							{pageSizeOptions.find((o) => o.value === pageSize)?.label ?? '20 per halaman'}
						</Select.Trigger>
						<Select.Content>
							{#each pageSizeOptions as option (option.value)}
								<Select.Item value={option.value} label={option.label} />
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				{#if totalPages > 1}
					<div class="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							disabled={currentPage === 1}
							onclick={() => (page = currentPage - 1)}
						>
							←
						</Button>
						<span class="font-mono text-sm text-text-secondary">
							{currentPage} / {totalPages}
						</span>
						<Button
							variant="outline"
							size="sm"
							disabled={currentPage === totalPages}
							onclick={() => (page = currentPage + 1)}
						>
							→
						</Button>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<AlertDialog.Root
	open={pendingDelete !== null}
	onOpenChange={(open) => {
		if (!open) pendingDelete = null;
	}}
>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Hapus post ini?</AlertDialog.Title>
			<AlertDialog.Description>
				{#if pendingDelete}
					<span class="font-mono text-foreground">{pendingDelete.topic}</span> akan dihapus permanen,
					beserta hasil riset dan seluruh prompt yang sudah digenerate. Tindakan ini tidak bisa dibatalkan.
				{/if}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Batal</AlertDialog.Cancel>
			<AlertDialog.Action onclick={confirmDelete} disabled={deleting !== null}>
				{deleting !== null ? 'Menghapus...' : 'Hapus permanen'}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
