<script lang="ts">
	import { signIn } from '@auth/sveltekit/client';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button/index.js';
	import { goto } from '$app/navigation';

	onMount(() => {
		if (page.data.session) {
			goto('/');
		}
	});
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100 px-4">
	<div
		class="w-full max-w-md space-y-8 rounded-2xl border border-gray-200 bg-white px-8 py-10 shadow-lg"
	>
		<div class="space-y-2 text-center">
			<h1 class="text-2xl font-semibold tracking-tight text-gray-900">
				Welcome at OnlyDevs Quizzes!
			</h1>
			<p class="text-sm text-gray-500">Sign in to continue.</p>
		</div>

		<div class="relative my-4">
			<div class="absolute inset-0 flex items-center">
				<span class="w-full border-t border-gray-300"></span>
			</div>
			<div class="relative flex justify-center text-xs uppercase">
				<span class="bg-white px-2 text-gray-500"> continue with </span>
			</div>
		</div>

		<Button
			onclick={() => signIn('google')}
			class="flex w-full cursor-pointer items-center justify-center gap-2 py-5"
		>
			<img
				src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png"
				alt="Google Logo"
				class="h-5 w-5"
			/>
			<span>Continue with Google</span>
		</Button>

		<p class="text-center text-[11px] leading-relaxed text-gray-400">
			This is Master Thesis project by Martin Baron
		</p>
	</div>
</div>
