<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Field from '$lib/components/ui/field';
	import * as Card from '$lib/components/ui/card';

	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleLogin(event: SubmitEvent) {
		event.preventDefault();
		error = '';
		loading = true;
		try {
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ password })
			});
			const data = (await res.json()) as { ok?: boolean; error?: string };
			if (!res.ok) {
				error = data.error ?? 'Login gagal';
			} else {
				window.location.href = '/owner';
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Terjadi kesalahan';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Login Owner</title>
</svelte:head>

<div class="mx-auto mt-16 max-w-sm px-4">
	<Card.Root>
		<Card.Header>
			<Card.Title>Login Owner</Card.Title>
			<Card.Description>Masuk untuk mengelola artikel.</Card.Description>
		</Card.Header>
		<Card.Content>
			<form onsubmit={handleLogin} class="flex flex-col gap-4">
				<Field.Field>
					<Field.FieldLabel for="password">Password</Field.FieldLabel>
					<Input
						id="password"
						type="password"
						bind:value={password}
						required
						autocomplete="current-password"
					/>
				</Field.Field>
				{#if error}
					<p class="text-sm text-destructive">{error}</p>
				{/if}
				<Button type="submit" disabled={loading}>
					{loading ? 'Memproses...' : 'Login'}
				</Button>
			</form>
		</Card.Content>
	</Card.Root>
</div>
