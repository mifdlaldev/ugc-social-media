<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import * as Field from '$lib/components/ui/field';
	import {
		PLACEMENT_SOURCE_STATUS_LABELS,
		PLATFORM_PLACEMENTS,
		findPlatformPlacement
	} from '$lib/catalog/platformPlacements';

	let { value = $bindable() }: { value: string } = $props();

	const platforms = [...new Set(PLATFORM_PLACEMENTS.map((placement) => placement.platform))];

	let selected = $derived(findPlatformPlacement(value));

	function placementsFor(platform: string) {
		return PLATFORM_PLACEMENTS.filter((placement) => placement.platform === platform);
	}

	function optionLabel(width: number, height: number, ratio: string, placement: string): string {
		return `${placement} · ${width}×${height} · ${ratio}`;
	}
</script>

<Field.Field>
	<Field.FieldLabel>Tujuan Posting &amp; Ukuran</Field.FieldLabel>
	<div class="flex items-center gap-3">
		<div class="min-w-0 flex-1">
			<Select.Root type="single" bind:value>
				<Select.Trigger>
					{#if selected}
						{selected.platform} — {selected.placement}
						<span class="font-mono text-text-muted">
							· {selected.width}×{selected.height} · {selected.ratio}
						</span>
					{:else}
						Pilih tujuan posting
					{/if}
				</Select.Trigger>
				<Select.Content>
					{#each platforms as platform (platform)}
						<Select.Group>
							<Select.GroupHeading>{platform}</Select.GroupHeading>
							{#each placementsFor(platform) as placement (placement.value)}
								<Select.Item
									value={placement.value}
									label={optionLabel(
										placement.width,
										placement.height,
										placement.ratio,
										placement.placement
									)}
								/>
							{/each}
						</Select.Group>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>

		{#if selected}
			<!-- Proportional preview: a pixel count is harder to picture than a shape. -->
			<div
				class="shrink-0 rounded border border-border bg-bg-elevated"
				style="aspect-ratio: {selected.width} / {selected.height}; height: 2.5rem;"
				aria-hidden="true"
			></div>
		{/if}
	</div>
	<Field.FieldDescription>
		{#if selected}
			{PLACEMENT_SOURCE_STATUS_LABELS[selected.sourceStatus]}{selected.fileSizeLimit
				? ` · batas berkas ${selected.fileSizeLimit}`
				: ' · batas berkas tidak didokumentasikan'}
		{:else}
			Ukuran kanvas akan disertakan di prompt agar hasil tidak perlu di-crop.
		{/if}
	</Field.FieldDescription>
</Field.Field>
