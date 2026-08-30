<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Badge } from '$lib/components/ui/badge';
	import * as Select from '$lib/components/ui/select';
	import * as Field from '$lib/components/ui/field';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	/* Seeded once on mount: the form owns its values after the initial load. */
	// svelte-ignore state_referenced_locally
	const initial = data.post;

	let topic = $state(initial.topic);
	let platform = $state(initial.platform);
	let tone = $state(initial.tone);
	let slideCount = $state(initial.slide_count);
	let excerpt = $state(initial.excerpt ?? '');
	let error = $state('');
	let loading = $state(false);

	const platforms = [
		{ value: 'instagram', label: 'Instagram' },
		{ value: 'facebook', label: 'Facebook' },
		{ value: 'linkedin', label: 'LinkedIn' }
	] as const;

	const tones = [
		{ value: 'informatif', label: 'Informatif' },
		{ value: 'detail', label: 'Detail' },
		{ value: 'observatif', label: 'Observatif' },
		{ value: 'menjual', label: 'Menjual' },
		{ value: 'creative', label: 'Creative' }
	] as const;

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
					platform,
					tone,
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
		<p class="text-text-secondary mt-2">
			Perbarui topik, platform, tone, jumlah slide, atau ringkasan. Hasil riset dan prompt yang sudah
			ada tidak dihapus.
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

				<div class="grid gap-6 sm:grid-cols-2">
					<Field.Field>
						<Field.FieldLabel>Platform</Field.FieldLabel>
						<Select.Root type="single" bind:value={platform}>
							<Select.Trigger>
								{platforms.find((p) => p.value === platform)?.label ?? platform}
							</Select.Trigger>
							<Select.Content>
								{#each platforms as p (p.value)}
									<Select.Item value={p.value} label={p.label} />
								{/each}
							</Select.Content>
						</Select.Root>
					</Field.Field>

					<Field.Field>
						<Field.FieldLabel>Tone</Field.FieldLabel>
						<Select.Root type="single" bind:value={tone}>
							<Select.Trigger>
								{tones.find((t) => t.value === tone)?.label ?? tone}
							</Select.Trigger>
							<Select.Content>
								{#each tones as t (t.value)}
									<Select.Item value={t.value} label={t.label} />
								{/each}
							</Select.Content>
						</Select.Root>
					</Field.Field>
				</div>

				<Field.Field>
					<Field.FieldLabel>Jumlah Slide (3-7)</Field.FieldLabel>
					<div class="flex items-center gap-4">
						<input
							type="range"
							min="3"
							max="7"
							step="1"
							bind:value={slideCount}
							class="accent-accent flex-1"
						/>
						<Badge variant="default" class="font-mono">{slideCount} slides</Badge>
					</div>
					<Field.FieldDescription>
						Mengubah jumlah slide tidak otomatis membuat ulang prompt. Generate ulang untuk
						menerapkannya.
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
						Maks 300 karakter. Akan tampil di public feed.
					</Field.FieldDescription>
				</Field.Field>

				{#if error}
					<p class="text-error text-sm">{error}</p>
				{/if}

				<div class="flex justify-end gap-2">
					<Button
						type="button"
						variant="ghost"
						onclick={() => goto(`/owner/edit/${initial.id}`)}
					>
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
