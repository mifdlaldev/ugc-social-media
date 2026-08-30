<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';

	let {
		postId,
		initialStyleLock,
		canGenerate,
		onChange
	}: {
		postId: string;
		initialStyleLock: string;
		canGenerate: boolean;
		onChange: (styleLock: string) => void;
	} = $props();

	// svelte-ignore state_referenced_locally
	let text = $state(initialStyleLock);
	// svelte-ignore state_referenced_locally
	let saved = $state(initialStyleLock);
	let generating = $state(false);
	let saving = $state(false);
	let error = $state('');
	let notice = $state('');

	let hasSaved = $derived(saved.trim().length > 0);
	let dirty = $derived(text !== saved);

	async function generate(replace: boolean) {
		error = '';
		notice = '';
		generating = true;
		try {
			const res = await fetch(`/api/posts/${postId}/style-lock`, { method: 'POST' });
			const payload = (await res.json()) as {
				success?: boolean;
				style_lock?: string;
				error?: string;
			};
			if (!res.ok || !payload.success || !payload.style_lock) {
				error = payload.error ?? 'Gagal membuat style lock';
				return;
			}
			text = payload.style_lock;
			saved = payload.style_lock;
			onChange(payload.style_lock);
			notice = replace ? 'Style lock dibuat ulang.' : 'Style lock dibuat.';
		} catch (err) {
			error = err instanceof Error ? err.message : 'Terjadi kesalahan';
		} finally {
			generating = false;
		}
	}

	async function save() {
		error = '';
		notice = '';
		saving = true;
		try {
			const res = await fetch(`/api/posts/${postId}/style-lock`, {
				method: 'PUT',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ style_lock: text })
			});
			const payload = (await res.json()) as {
				success?: boolean;
				style_lock?: string;
				error?: string;
			};
			if (!res.ok || !payload.success || !payload.style_lock) {
				error = payload.error ?? 'Gagal menyimpan style lock';
				return;
			}
			text = payload.style_lock;
			saved = payload.style_lock;
			onChange(payload.style_lock);
			notice = 'Style lock disimpan.';
		} catch (err) {
			error = err instanceof Error ? err.message : 'Terjadi kesalahan';
		} finally {
			saving = false;
		}
	}
</script>

<Card.Root class="mb-6">
	<Card.Header>
		<Card.Title>Style Lock</Card.Title>
		<Card.Description>
			Satu spesifikasi visual yang dipakai ulang apa adanya oleh semua slide, supaya carousel
			konsisten dari hook sampai CTA. Isinya hanya estetika: medium, palet, tipografi, bahasa
			bentuk, dan latar — bukan fakta, angka, material, atau standar.
		</Card.Description>
	</Card.Header>
	<Card.Content>
		{#if !canGenerate}
			<p class="text-sm text-text-secondary">
				Jalankan riset dulu. Style lock dibuat setelah ada sumber riset.
			</p>
		{:else}
			{#if hasSaved}
				<Textarea bind:value={text} rows={10} class="mb-3 font-mono text-xs" />
				<p class="mb-3 text-xs text-text-muted">
					Teks Anda dipakai apa adanya. Sistem tidak menyelaraskannya dengan bentuk visual terpilih.
					Generate slide memakai style lock tersimpan kecuali Anda menekan Buat Ulang.
				</p>
			{:else}
				<p class="mb-3 text-sm text-text-secondary">
					Belum ada style lock. Tanpa ini, generate slide akan ditolak.
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

			<div class="flex flex-wrap justify-end gap-2">
				{#if hasSaved}
					<Button variant="ghost" size="sm" disabled={generating} onclick={() => generate(true)}>
						{generating ? 'Membuat...' : 'Buat Ulang'}
					</Button>
					<Button variant="outline" size="sm" disabled={saving || !dirty} onclick={save}>
						{saving ? 'Menyimpan...' : 'Simpan'}
					</Button>
				{:else}
					<Button size="sm" disabled={generating} onclick={() => generate(false)}>
						{generating ? 'Membuat...' : 'Buat Style Lock'}
					</Button>
				{/if}
			</div>
		{/if}
	</Card.Content>
</Card.Root>
