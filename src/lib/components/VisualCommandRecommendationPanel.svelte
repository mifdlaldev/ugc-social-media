<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { findVisualCommand } from '$lib/catalog/visualCommands';
	import LoadingIndicator from '$lib/components/LoadingIndicator.svelte';

	interface Suggestion {
		command: string;
		reason: string;
	}

	interface PerSlideSuggestion {
		slide_index: number;
		command: string;
		reason: string;
	}

	let {
		postId,
		currentCommand,
		canRecommend,
		initialPrimary = null,
		initialAlternatives = [],
		initialPerSlide = null,
		onApply
	}: {
		postId: string;
		currentCommand: string;
		canRecommend: boolean;
		initialPrimary: Suggestion | null;
		initialAlternatives: Suggestion[];
		initialPerSlide: PerSlideSuggestion[] | null;
		onApply: (command: string) => void;
	} = $props();

	// svelte-ignore state_referenced_locally
	let primary = $state<Suggestion | null>(initialPrimary);
	// svelte-ignore state_referenced_locally
	let alternatives = $state<Suggestion[]>(initialAlternatives);
	// svelte-ignore state_referenced_locally
	let perSlide = $state<PerSlideSuggestion[] | null>(initialPerSlide);
	let loading = $state(false);
	let applying = $state('');
	let error = $state('');
	let notice = $state('');

	let hasRecommendation = $derived(primary !== null);

	function label(command: string): string {
		return findVisualCommand(command)?.label ?? command;
	}

	async function request(regenerate: boolean) {
		error = '';
		notice = '';
		loading = true;
		try {
			const res = await fetch(`/api/posts/${postId}/visual-command-recommendation`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ regenerate })
			});
			const payload = (await res.json()) as {
				success?: boolean;
				primary?: Suggestion;
				alternatives?: Suggestion[];
				per_slide?: PerSlideSuggestion[] | null;
				error?: string;
			};
			if (!res.ok || !payload.success || !payload.primary) {
				error = payload.error ?? 'Gagal mengambil rekomendasi';
				return;
			}
			primary = payload.primary;
			alternatives = payload.alternatives ?? [];
			perSlide = payload.per_slide ?? null;
			notice = regenerate ? 'Rekomendasi diperbarui.' : 'Rekomendasi dimuat dari penyimpanan.';
		} catch (err) {
			error = err instanceof Error ? err.message : 'Terjadi kesalahan';
		} finally {
			loading = false;
		}
	}

	async function apply(command: string) {
		error = '';
		notice = '';
		applying = command;
		try {
			const res = await fetch(`/api/posts/${postId}/apply-visual-command`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ visual_command: command })
			});
			const payload = (await res.json()) as {
				success?: boolean;
				visual_command?: string;
				error?: string;
			};
			if (!res.ok || !payload.success || !payload.visual_command) {
				error = payload.error ?? 'Gagal menerapkan bentuk visual';
				return;
			}
			onApply(payload.visual_command);
			notice = `Bentuk visual diubah ke ${payload.visual_command}.`;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Terjadi kesalahan';
		} finally {
			applying = '';
		}
	}
</script>

<Card.Root class="mb-6">
	<Card.Header>
		<Card.Title>Rekomendasi Bentuk Visual</Card.Title>
		<Card.Description>
			Saran berdasarkan topik dan sumber riset yang sudah disetujui. Hanya saran — pilihan Anda yang
			dipakai saat generate. Tidak ada yang berubah sampai Anda menekan Pakai.
		</Card.Description>
	</Card.Header>
	<Card.Content>
		{#if !canRecommend}
			<p class="text-sm text-text-secondary">
				Jalankan riset dulu. Rekomendasi dibuat dari topik dan sumber riset.
			</p>
		{:else}
			<div class="mb-4 flex items-center gap-2 text-sm text-text-secondary">
				<span>Terpilih sekarang:</span>
				<Badge variant="outline" class="font-mono">{currentCommand}</Badge>
				<span class="text-text-muted">{label(currentCommand)}</span>
			</div>

			{#if hasRecommendation && primary}
				<div class="mb-4 rounded-md border border-border p-4">
					<div class="mb-2 flex flex-wrap items-center justify-between gap-2">
						<div class="flex items-center gap-2">
							<Badge class="font-mono">{primary.command}</Badge>
							<span class="text-sm text-foreground">{label(primary.command)}</span>
						</div>
						{#if primary.command === currentCommand}
							<span class="text-xs text-text-muted">Sudah dipakai</span>
						{:else}
							<Button
								size="sm"
								disabled={applying !== ''}
								onclick={() => primary && apply(primary.command)}
							>
								{applying === primary.command ? 'Menerapkan...' : 'Pakai'}
							</Button>
						{/if}
					</div>
					<p class="text-sm text-text-secondary">{primary.reason}</p>
				</div>

				{#if alternatives.length > 0}
					<h3 class="mb-2 text-sm font-medium text-foreground">Alternatif</h3>
					<div class="mb-4 grid gap-2">
						{#each alternatives as alt (alt.command)}
							<div class="rounded-md border border-border p-3">
								<div class="mb-1 flex flex-wrap items-center justify-between gap-2">
									<div class="flex items-center gap-2">
										<Badge variant="secondary" class="font-mono">{alt.command}</Badge>
										<span class="text-sm text-foreground">{label(alt.command)}</span>
									</div>
									{#if alt.command === currentCommand}
										<span class="text-xs text-text-muted">Sudah dipakai</span>
									{:else}
										<Button
											variant="outline"
											size="sm"
											disabled={applying !== ''}
											onclick={() => apply(alt.command)}
										>
											{applying === alt.command ? 'Menerapkan...' : 'Pakai'}
										</Button>
									{/if}
								</div>
								<p class="text-sm text-text-secondary">{alt.reason}</p>
							</div>
						{/each}
					</div>
				{/if}

				{#if perSlide && perSlide.length > 0}
					<h3 class="mb-2 text-sm font-medium text-foreground">Rencana per slide</h3>
					<p class="mb-2 text-xs text-text-muted">
						Referensi saja. Generate memakai satu bentuk visual untuk seluruh carousel.
					</p>
					<div class="mb-4 grid gap-2">
						{#each perSlide as entry (entry.slide_index)}
							<div class="flex flex-wrap items-baseline gap-2 text-sm">
								<span class="font-mono text-xs text-text-muted">
									Slide {entry.slide_index + 1}
								</span>
								<Badge variant="outline" class="font-mono">{entry.command}</Badge>
								<span class="text-text-secondary">{entry.reason}</span>
							</div>
						{/each}
					</div>
				{/if}
			{:else}
				<p class="mb-3 text-sm text-text-secondary">
					Belum ada rekomendasi. Bentuk visual pilihan Anda tetap dipakai.
				</p>
			{/if}

			{#if error}
				<Alert class="mb-3">
					<AlertTitle>Gagal</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			{/if}

			{#if notice}
				<p class="mb-3 text-xs text-success">{notice}</p>
			{/if}

			<div class="flex justify-end">
				<Button
					variant={hasRecommendation ? 'ghost' : 'default'}
					size="sm"
					disabled={loading}
					onclick={() => request(hasRecommendation)}
				>
					{loading ? 'Menganalisis...' : hasRecommendation ? 'Minta Ulang' : 'Minta Rekomendasi'}
				</Button>
			</div>
			{#if loading}
				<LoadingIndicator label="Sedang menganalisis bentuk visual" hint="AI" />
			{/if}
		{/if}
	</Card.Content>
</Card.Root>
