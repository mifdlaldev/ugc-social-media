<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { goto } from '$app/navigation';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let post = $derived(data.post);
	let slides = $derived(data.slides);
	let variants = $derived(data.variants);
	let generating = $state(false);
	let currentSlide = $state(0);
	let currentProvider = $state('gpt-image');
	let copiedId = $state<string | null>(null);

	const providers = [
		{ id: 'gpt-image', label: 'GPT Image' },
		{ id: 'nano-banana', label: 'Nano Banana' },
		{ id: 'recraft', label: 'Recraft' }
	] as const;

	function getVariantsForSlide(slideId: string, provider: string) {
		return variants.find((v) => v.slide_id === slideId && v.provider === provider);
	}

	async function runGenerate() {
		generating = true;
		try {
			const res = await fetch(`/api/posts/${post.id}/generate`, { method: 'POST' });
			const data = (await res.json()) as { success?: boolean; slideCount?: number; error?: string };
			if (!res.ok || !data.success) {
				alert(data.error ?? 'Generate gagal. Coba lagi.');
			} else {
				window.location.reload();
			}
		} catch (err) {
			alert(err instanceof Error ? err.message : 'Terjadi kesalahan');
		} finally {
			generating = false;
		}
	}

	async function copyText(text: string, id: string) {
		await navigator.clipboard.writeText(text);
		copiedId = id;
		setTimeout(() => (copiedId = null), 2000);
	}

	function providerLabel(id: string): string {
		return providers.find((p) => p.id === id)?.label ?? id;
	}
</script>

<svelte:head>
	<title>Generate Prompt — {post.topic}</title>
</svelte:head>

<div class="mx-auto max-w-5xl px-6 py-12">
	<header class="mb-8 flex items-end justify-between gap-4">
		<div class="min-w-0 flex-1">
			<div class="text-text-muted mb-2 flex items-center gap-2 font-mono text-xs">
				<span>#{post.id}</span>
			</div>
			<h1 class="text-display text-foreground truncate font-mono">{post.topic}</h1>
			<div class="text-text-secondary mt-3 flex flex-wrap items-center gap-2">
				<Badge variant="secondary">{post.platform}</Badge>
				<Badge variant="outline">{post.tone}</Badge>
				<Badge variant="outline">{post.slide_count} slides</Badge>
			</div>
		</div>
		<div class="flex gap-2">
			<Button variant="outline" onclick={() => goto(`/owner/edit/${post.id}`)}>Edit</Button>
			<Button variant="ghost" onclick={() => goto('/owner')}>Kembali</Button>
		</div>
	</header>

	{#if slides.length === 0}
		<Card.Root class="mb-6">
			<Card.Content class="py-16 text-center">
				<p class="text-text-muted text-caption mb-4">Belum ada prompt yang digenerate.</p>
				<Button onclick={runGenerate} disabled={generating} size="lg">
					{generating ? 'Generating...' : 'Generate Prompt'}
				</Button>
			</Card.Content>
		</Card.Root>
	{:else}
		<div class="mb-6 flex items-center justify-between">
			<div class="flex items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					disabled={currentSlide === 0}
					onclick={() => currentSlide--}
				>
					←
				</Button>
				<span class="text-text-secondary font-mono text-sm">
					Slide {currentSlide + 1} / {slides.length}
				</span>
				<Button
					variant="outline"
					size="sm"
					disabled={currentSlide === slides.length - 1}
					onclick={() => currentSlide++}
				>
					→
				</Button>
			</div>
			<Button onclick={runGenerate} disabled={generating} variant="secondary" size="sm">
				{generating ? 'Generating...' : 'Generate Ulang'}
			</Button>
		</div>

		{@const slide = slides[currentSlide]}
		{#if slide}
			<Card.Root class="mb-6">
				<Card.Header>
					<div class="flex items-center gap-2">
						<Badge variant="default">{slide.slide_type}</Badge>
						<h2 class="text-h2 text-foreground">{slide.slide_title}</h2>
					</div>
				</Card.Header>
				<Card.Content>
					<div class="mb-4">
						<h3 class="text-caption text-text-muted mb-1">Research Context</h3>
						<p class="text-text-secondary text-sm">{slide.research_context}</p>
					</div>

					<div class="border-border mb-4 border-b pb-4">
						<div class="flex gap-1">
							{#each providers as p (p.id)}
								<Button
									variant={currentProvider === p.id ? 'default' : 'ghost'}
									size="sm"
									onclick={() => (currentProvider = p.id)}
								>
									{p.label}
								</Button>
							{/each}
						</div>
					</div>

					{@const variant = getVariantsForSlide(slide.id, currentProvider)}
					{#if variant}
						<div class="mb-4">
							<h3 class="text-caption text-text-muted mb-1">
								Prompt ({providerLabel(variant.provider)})
							</h3>
							<pre
								class="bg-bg-secondary text-text-primary overflow-x-auto rounded-lg p-4 font-mono text-sm whitespace-pre-wrap">{variant.prompt_text}</pre>
						</div>

						<div class="grid gap-4 sm:grid-cols-2">
							<div>
								<h3 class="text-caption text-text-muted mb-1">Visual Notes</h3>
								<p class="text-text-secondary text-sm">{variant.visual_notes}</p>
							</div>
							<div>
								<h3 class="text-caption text-text-muted mb-1">On-Image Text</h3>
								<p class="text-text-primary font-mono text-sm">{variant.on_image_text}</p>
							</div>
						</div>

						<div class="mt-4 flex justify-end gap-2">
							<Button
								variant="outline"
								size="sm"
								onclick={() =>
									copyText(variant.prompt_text, `slide-${slide.id}-${variant.provider}`)}
							>
								{copiedId === `slide-${slide.id}-${variant.provider}` ? 'Tersalin!' : 'Copy Prompt'}
							</Button>
						</div>
					{:else}
						<p class="text-text-muted text-sm">Variant tidak ditemukan.</p>
					{/if}
				</Card.Content>
			</Card.Root>
		{/if}

		<div class="flex justify-between">
			<Button variant="ghost" onclick={() => goto(`/owner/edit/${post.id}`)}
				>← Kembali ke Riset</Button
			>
			<Button onclick={() => goto('/owner')}>Selesai →</Button>
		</div>
	{/if}
</div>
