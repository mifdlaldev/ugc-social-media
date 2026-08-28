<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';

	type Preset = {
		id: number;
		name: string;
		slug: string;
		platform: string;
		aspect_ratio: string;
		language: string;
		visual_tone: string | null;
		is_active: boolean;
		sort_order: number;
	};

	let {
		presets,
		selectedId,
		onselect
	}: {
		presets: Preset[];
		selectedId: number | null;
		onselect: (id: number) => void;
	} = $props();
</script>

<div class="flex flex-col gap-2">
	{#each presets as preset (preset.id)}
		<Card.Root
			class="cursor-pointer transition-colors {preset.id === selectedId ? 'border-primary' : ''}"
			onclick={() => onselect(preset.id)}
		>
			<Card.Content class="flex items-center justify-between py-3">
				<div>
					<div class="flex flex-wrap items-center gap-2">
						<span class="font-medium">{preset.name}</span>
						<Badge variant="secondary">{preset.platform}</Badge>
						<Badge variant="outline">{preset.aspect_ratio}</Badge>
					</div>
					{#if preset.visual_tone}
						<p class="mt-1 text-sm text-muted-foreground">{preset.visual_tone}</p>
					{/if}
				</div>
				{#if preset.id === selectedId}
					<Badge variant="default">Terpilih</Badge>
				{/if}
			</Card.Content>
		</Card.Root>
	{:else}
		<p class="text-muted-foreground">Belum ada preset aktif.</p>
	{/each}
</div>
