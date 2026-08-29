<script lang="ts">
	import type { PageProps } from './$types';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import PromptPresetSelector from '$lib/components/PromptPresetSelector.svelte';
	import PromptResult from '$lib/components/PromptResult.svelte';
	import type { PromptGenerationResult } from '$lib/server/promptSchema';

	let { data }: PageProps = $props();
	const post = $derived(data.post);
	const presets = $derived(data.presets);

	let selectedPresetId = $state<number | null>(null);
	let loading = $state(false);
	let errorMessage = $state('');
	let warnMessage = $state('');
	let result = $state<PromptGenerationResult | null>(null);

	async function runGenerate() {
		if (!selectedPresetId) {
			errorMessage = 'Pilih preset terlebih dahulu.';
			return;
		}
		errorMessage = '';
		warnMessage = '';
		result = null;
		loading = true;
		try {
			const res = await fetch(`/api/posts/${post.id}/generate`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ presetId: selectedPresetId })
			});
			const payload = (await res.json()) as Record<string, unknown>;
			if (payload.status === 'success') {
				result = payload.result as PromptGenerationResult;
			} else if (payload.status === 'fidelity_rejected') {
				const tokens = Array.isArray(payload.rejectedTokens)
					? (payload.rejectedTokens as string[]).join(', ')
					: '';
				warnMessage = `${String(payload.reason ?? 'Fidelitas ditolak')}${tokens ? ` — token: ${tokens}` : ''}`;
			} else {
				errorMessage = String(payload.reason ?? payload.error ?? `Error ${res.status}`);
			}
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan';
		} finally {
			loading = false;
		}
	}

	function reset() {
		result = null;
		errorMessage = '';
		warnMessage = '';
	}
</script>

<svelte:head>
	<title>Generate Prompt — {post.title}</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-8">
	<header class="mb-6">
		<a href="/owner" class="text-sm text-muted-foreground hover:underline">← Workspace</a>
		<h1 class="mt-2 text-2xl font-bold tracking-tight">Generate Prompt</h1>
		<p class="mt-1 text-muted-foreground">{post.title}</p>
	</header>

	{#if result}
		<PromptResult {result} onretry={reset} />
	{:else}
		<div class="flex flex-col gap-4">
			<Card.Root>
				<Card.Header>
					<Card.Title>Pilih Preset</Card.Title>
					<Card.Description>
						Preset menentukan platform, aspect ratio, dan tone visual. Preset tidak menambah fakta
						teknis.
					</Card.Description>
				</Card.Header>
				<Card.Content>
					{#if presets.length > 0}
						<PromptPresetSelector
							{presets}
							selectedId={selectedPresetId}
							onselect={(id) => (selectedPresetId = id)}
						/>
					{:else}
						<p class="text-muted-foreground">
							Belum ada preset aktif. Buat dulu di
							<a href="/owner/presets" class="underline">Presets</a>.
						</p>
					{/if}
				</Card.Content>
				<Card.Footer>
					<Button disabled={loading || !selectedPresetId} onclick={runGenerate}>
						{loading ? 'Membuat prompt...' : 'Generate Prompt'}
					</Button>
				</Card.Footer>
			</Card.Root>

			{#if errorMessage}
				<Alert variant="destructive">
					<AlertTitle>Gagal membuat prompt</AlertTitle>
					<AlertDescription>{errorMessage}</AlertDescription>
				</Alert>
			{/if}

			{#if warnMessage}
				<Alert>
					<AlertTitle>Fidelitas ditolak</AlertTitle>
					<AlertDescription>{warnMessage}</AlertDescription>
				</Alert>
			{/if}
		</div>
	{/if}
</div>
