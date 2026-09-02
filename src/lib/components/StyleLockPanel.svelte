<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Switch } from '$lib/components/ui/switch';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import LoadingIndicator from '$lib/components/LoadingIndicator.svelte';

	let {
		postId,
		initialStyleLock,
		initialEnabled = true,
		canGenerate,
		onChange,
		onEnabledChange
	}: {
		postId: string;
		initialStyleLock: string;
		initialEnabled?: boolean;
		canGenerate: boolean;
		onChange: (styleLock: string) => void;
		onEnabledChange?: (enabled: boolean) => void;
	} = $props();

	let text = $state(initialStyleLock);
	let saved = $state(initialStyleLock);
	let enabled = $state(initialEnabled);
	let generating = $state(false);
	let saving = $state(false);
	let toggling = $state(false);
	let error = $state('');
	let notice = $state('');

	let hasSaved = $derived(saved.trim().length > 0);
	let dirty = $derived(text !== saved);

	async function toggleEnabled() {
		toggling = true;
		error = '';
		notice = '';
		try {
			const res = await fetch(`/api/posts/${postId}/style-lock-enabled`, {
				method: 'PATCH',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ enabled: !enabled })
			});
			const payload = (await res.json()) as {
				success?: boolean;
				style_lock_enabled?: boolean;
				error?: string;
			};
			if (!res.ok || !payload.success) {
				error = payload.error ?? 'Gagal toggle';
				return;
			}
			enabled = payload.style_lock_enabled ?? !enabled;
			onEnabledChange?.(enabled);
			notice = enabled ? 'Style lock aktif.' : 'Style lock nonaktif. Tiap slide bebas creative.';
		} catch (err) {
			error = err instanceof Error ? err.message : 'Terjadi kesalahan';
		} finally {
			toggling = false;
		}
	}

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
			enabled = true;
			onChange(payload.style_lock);
			onEnabledChange?.(true);
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
		<div class="flex items-center justify-between gap-4">
			<div>
				<Card.Title>Style Lock</Card.Title>
				<Card.Description>
					Satu spesifikasi visual yang dipakai ulang apa adanya oleh semua slide, supaya carousel
					konsisten dari hook sampai CTA. Isinya hanya estetika: medium, palet, tipografi, bahasa
					bentuk, dan latar — bukan fakta, angka, material, atau standar.
				</Card.Description>
			</div>
			{#if hasSaved && canGenerate}
				<div class="flex shrink-0 items-center gap-2">
					<Switch
						checked={enabled}
						onclick={toggleEnabled}
						disabled={toggling}
						aria-label="Toggle style lock"
					/>
					<span class="text-sm text-text-secondary whitespace-nowrap">
						{enabled ? 'Aktif' : 'Nonaktif'}
					</span>
				</div>
			{/if}
		</div>
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
				</p>
				{#if !enabled}
					<p class="mb-3 text-xs text-warning">
						Style lock nonaktif. Generate slide tidak akan memakai teks ini — tiap slide bebas creative.
						Teks tetap disimpan jika Anda ingin mengaktifkannya lagi.
					</p>
				{/if}
			{:else}
				<p class="mb-3 text-sm text-text-secondary">
					Belum ada style lock. Generate slide akan memakai visual notes tiap slide langsung.
				</p>
				<p class="mb-3 text-xs text-text-muted">
					Kalau mau konsisten, buat style lock dulu. Kalau mau bebas creative, langsung generate saja.
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
			{#if generating}
				<LoadingIndicator
					label="Sedang membuat style lock"
					hint="Menganalisis tema untuk spek visual"
				/>
			{/if}
		{/if}
	</Card.Content>
</Card.Root>