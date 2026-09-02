<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { goto } from '$app/navigation';
	import { findPlatformPlacement } from '$lib/catalog/platformPlacements';
	import StyleLockPanel from '$lib/components/StyleLockPanel.svelte';
	import VisualCommandRecommendationPanel from '$lib/components/VisualCommandRecommendationPanel.svelte';
	import LoadingIndicator from '$lib/components/LoadingIndicator.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let post = $derived(data.post);
	let sources = $derived(data.sources);
	/**
	 * The panel can create or edit the style lock without a page reload, so the
	 * approve gate reads this local value and falls back to what the server loaded.
	 */
	let localStyleLock = $state<string | null>(null);
	let styleLock = $derived(localStyleLock ?? data.styleLock);
	/** Same pattern for an applied command: reflect it before the load refreshes. */
	let localCommand = $state<string | null>(null);
	let visualCommand = $derived(localCommand ?? data.post.visual_command);
	/** Mirrors the style-lock toggle so the approve gate reads the live value. */
	let localEnabled = $state<boolean>(data.post.style_lock_enabled ?? true);
	let styleLockEnabled = $derived(localEnabled);
	let researching = $state(false);
	let approveError = $state('');

	async function runResearch() {
		researching = true;
		try {
			const res = await fetch(`/api/posts/${post.id}/research`, { method: 'POST' });
			const data = (await res.json()) as { success?: boolean; count?: number; error?: string };
			if (!res.ok || !data.success) {
				alert(data.error ?? 'Riset gagal. Coba lagi.');
			} else {
				window.location.reload();
			}
		} catch (err) {
			alert(err instanceof Error ? err.message : 'Terjadi kesalahan');
		} finally {
			researching = false;
		}
	}

	async function approveResearch() {
		approveError = '';
		if (sources.length === 0) {
			approveError = 'Belum ada sumber. Jalankan riset dulu.';
			return;
		}
		if (styleLockEnabled && styleLock.trim().length === 0) {
			approveError = 'Belum ada style lock. Buat style lock dulu di panel di atas.';
			return;
		}
		try {
			const res = await fetch(`/api/posts/${post.id}/approve-research`, { method: 'POST' });
			const data = (await res.json()) as { ok?: boolean; error?: string };
			if (!res.ok || !data.ok) {
				approveError = data.error ?? 'Gagal approve';
			} else {
				goto(`/owner/generate/${post.id}`);
			}
		} catch (err) {
			approveError = err instanceof Error ? err.message : 'Terjadi kesalahan';
		}
	}

	function placementLabel(value: string): string {
		const placement = findPlatformPlacement(value);
		return placement
			? `${placement.platform} ${placement.width}×${placement.height} · ${placement.ratio}`
			: value;
	}

	function truncateSnippet(s: string | null, max = 180): string {
		if (!s) return '';
		return s.length > max ? s.slice(0, max) + '...' : s;
	}
</script>

<svelte:head>
	<title>Edit Post #{post.id}</title>
</svelte:head>

<div class="mx-auto max-w-4xl px-6 py-12">
	<header class="mb-8 flex items-end justify-between gap-4">
		<div class="min-w-0 flex-1">
			<div class="mb-2 flex items-center gap-2 font-mono text-xs text-text-muted">
				<span>#{post.id}</span>
			</div>
			<h1 class="text-display truncate font-mono text-foreground">{post.topic}</h1>
			<div class="mt-3 flex flex-wrap items-center gap-2 text-text-secondary">
				<Badge variant="secondary">{placementLabel(post.platform_placement)}</Badge>
				<Badge variant="outline" class="font-mono">{visualCommand}</Badge>
				<Badge variant="outline">{post.slide_count} slides</Badge>
			</div>
		</div>
		<div class="flex gap-2">
			<Button variant="outline" onclick={() => goto(`/owner/edit/${post.id}/detail`)}>
				Ubah Detail
			</Button>
			<Button variant="ghost" onclick={() => goto('/owner')}>Kembali</Button>
		</div>
	</header>

	<Card.Root class="mb-6">
		<Card.Header>
			<Card.Title>Riset</Card.Title>
			<Card.Description>
				AI akan mencari data real-time via You.com. Tinjau hasil sebelum generate prompt.
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="flex items-center justify-between gap-4">
				<p class="text-sm text-text-secondary">
					{sources.length === 0
						? 'Belum ada riset. Klik tombol untuk mulai.'
						: `${sources.length} sumber tersimpan.`}
				</p>
				<Button onclick={runResearch} disabled={researching}>
					{researching ? 'Mencari...' : sources.length === 0 ? 'Riset Sekarang' : 'Riset Ulang'}
				</Button>
			</div>
			{#if researching}
				<LoadingIndicator label="Sedang mencari sumber riset" hint="You.com" />
			{/if}
		</Card.Content>
	</Card.Root>

	<StyleLockPanel
		postId={post.id}
		initialStyleLock={data.styleLock}
		initialEnabled={data.post.style_lock_enabled}
		canGenerate={sources.length > 0}
		onChange={(value) => (localStyleLock = value)}
		onEnabledChange={(value) => (localEnabled = value)}
	/>

	<VisualCommandRecommendationPanel
		postId={post.id}
		currentCommand={visualCommand}
		canRecommend={sources.length > 0}
		initialPrimary={data.recommendation
			? { command: data.recommendation.primary_command, reason: data.recommendation.primary_reason }
			: null}
		initialAlternatives={data.recommendation?.alternatives ?? []}
		initialPerSlide={data.recommendation?.per_slide ?? null}
		onApply={(value) => (localCommand = value)}
	/>

	{#if sources.length > 0}
		<section class="mb-6">
			<h2 class="text-h2 mb-4 text-foreground">Hasil Riset</h2>
			<div class="grid gap-3">
				{#each sources as source (source.id)}
					<Card.Root class="hover-lift transition-base">
						<Card.Content class="p-5">
							<h3 class="text-h3 mb-2 line-clamp-1 text-foreground">
								{source.source_title ?? 'Tanpa judul'}
							</h3>
							<p class="mb-3 text-sm text-text-secondary">
								{truncateSnippet(source.source_snippet)}
							</p>
							<a
								href={source.source_url}
								target="_blank"
								rel="noopener noreferrer"
								class="font-mono text-xs text-accent hover:underline"
							>
								{source.source_url}
							</a>
						</Card.Content>
					</Card.Root>
				{/each}
			</div>
		</section>

		{#if approveError}
			<Alert class="mb-6">
				<AlertTitle>Gagal</AlertTitle>
				<AlertDescription>{approveError}</AlertDescription>
			</Alert>
		{/if}

		<div class="flex justify-end">
			<Button onclick={approveResearch} size="lg">Approve & Generate</Button>
		</div>
	{/if}
</div>
