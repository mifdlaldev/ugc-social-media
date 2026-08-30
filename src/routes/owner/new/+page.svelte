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

	let topic = $state('');
	let platformPlacement = $state('instagram-feed-portrait');
	let visualCommand = $state('/infographic');
	let slideCount = $state(5);
	let excerpt = $state('');
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
			const res = await fetch('/api/posts', {
				method: 'POST',
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
			let data: { id?: string; error?: string } = {};
			if (contentType.includes('application/json')) {
				data = (await res.json()) as { id?: string; error?: string };
			} else {
				const text = await res.text();
				data = { error: text || `HTTP ${res.status}` };
			}
			if (!res.ok || !data.id) {
				error = data.error ?? 'Gagal membuat post';
			} else {
				goto(`/owner/edit/${data.id}`);
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Terjadi kesalahan';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Post Baru</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-6 py-12">
	<header class="mb-8">
		<h1 class="text-display text-foreground">Post Baru</h1>
		<p class="mt-2 text-text-secondary">
			Tulis topik social media, pilih bentuk visual dan ukuran. AI akan riset & generate prompt
			carousel.
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
						Idealnya 3-5 untuk hook singkat, 6-7 untuk edukasi mendalam.
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
					<Button type="button" variant="ghost" onclick={() => goto('/owner')}>Batal</Button>
					<Button type="submit" disabled={loading}>
						{loading ? 'Menyimpan...' : 'Buat & Lanjut Riset'}
					</Button>
				</div>
			</form>
		</Card.Content>
	</Card.Root>
</div>
