<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Badge } from '$lib/components/ui/badge';
	import * as Field from '$lib/components/ui/field';
	import { goto } from '$app/navigation';
	import VisualCommandSelect from '$lib/components/VisualCommandSelect.svelte';
	import PlatformPlacementSelect from '$lib/components/PlatformPlacementSelect.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	/* Seeded once on mount: the form owns its values after the initial load. */
	// svelte-ignore state_referenced_locally
	const initial = data.post;

	let topic = $state(initial.topic);
	let platformPlacement = $state<string>(initial.platform_placement);
	let visualCommand = $state<string>(initial.visual_command);
	let slideCount = $state(initial.slide_count);
	let excerpt = $state(initial.excerpt ?? '');
	let error = $state('');
	let loading = $state(false);

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		error = '';
		if (topic.trim().length === 0) {
			error = 'Topik wajib diisi';
			return;
		}
		loading = true;
		try {
			const res = await fetch(`/api/posts/${initial.id}`, {
				method: 'PUT',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					topic: topic.trim(),
					platform_placement: platformPlacement,
					visual_command: visualCommand,
					slide_count: slideCount,
					excerpt: excerpt.trim() || undefined
				})
			});
			const contentType = res.headers.get('content-type') ?? '';
			let payload: { id?: string; error?: string } = {};
			if (contentType.includes('application/json')) {
				payload = (await res.json()) as { id?: string; error?: string };
			} else {
				const text = await res.text();
				payload = { error: text || `HTTP ${res.status}` };
			}
			if (!res.ok || !payload.id) {
				error = payload.error ?? 'Gagal menyimpan perubahan';
			} else {
				goto(`/owner/edit/${initial.id}`);
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Terjadi kesalahan';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Ubah Detail Post</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-6 py-12">
	<header class="mb-8">
		<h1 class="text-display text-foreground">Ubah Detail Post</h1>
		<p class="mt-2 text-text-secondary">
			Perbarui topik, bentuk visual, ukuran, jumlah slide, atau ringkasan. Hasil riset dan prompt
			yang sudah ada tidak dihapus.
		</p>
	</header>

	<Card.Root>
		<Card.Content class="p-8">
			<form onsubmit={handleSubmit} class="flex flex-col gap-6">
				<Field.Field>
					<Field.FieldLabel for="topic">Topik</Field.FieldLabel>
					<Input
						id="topic"
						bind:value={topic}
						placeholder="contoh: Bata merah vs bata ringan"
						maxlength={200}
						required
						class="font-mono"
					/>
					<Field.FieldDescription>
						Maks 200 karakter. Akan jadi judul carousel.
					</Field.FieldDescription>
				</Field.Field>

				<VisualCommandSelect bind:value={visualCommand} />
				<PlatformPlacementSelect bind:value={platformPlacement} />

				<Field.Field>
					<Field.FieldLabel>Jumlah Slide (3-7)</Field.FieldLabel>
					<div class="flex items-center gap-4">
						<input
							type="range"
							min="3"
							max="7"
							step="1"
							bind:value={slideCount}
							class="flex-1 accent-accent"
						/>
						<Badge variant="default" class="font-mono">{slideCount} slides</Badge>
					</div>
					<Field.FieldDescription>
						Mengubah bentuk visual, ukuran, atau jumlah slide tidak otomatis membuat ulang prompt.
						Generate ulang untuk menerapkannya.
					</Field.FieldDescription>
				</Field.Field>

				<Field.Field>
					<Field.FieldLabel for="excerpt">Ringkasan (opsional)</Field.FieldLabel>
					<Textarea
						id="excerpt"
						bind:value={excerpt}
						placeholder="Konteks tambahan untuk AI..."
						rows={3}
						maxlength={300}
					/>
					<Field.FieldDescription>
						Maks 300 karakter. Akan dipakai sebagai konteks tambahan.
					</Field.FieldDescription>
				</Field.Field>

				{#if error}
					<p class="text-sm text-error">{error}</p>
				{/if}

				<div class="flex justify-end gap-2">
					<Button type="button" variant="ghost" onclick={() => goto(`/owner/edit/${initial.id}`)}>
						Batal
					</Button>
					<Button type="submit" disabled={loading}>
						{loading ? 'Menyimpan...' : 'Simpan Perubahan'}
					</Button>
				</div>
			</form>
		</Card.Content>
	</Card.Root>
</div>
