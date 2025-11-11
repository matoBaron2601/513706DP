<script lang="ts">
	import { signIn } from '@auth/sveltekit/client';
	import { CircleQuestionMark } from '@lucide/svelte';
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

<div class="flex h-full justify-center items-center gap-8 -translate-y-20">
	<div class="text-center min-w-[300px]">
		<Button
			onclick={() => signIn('google')}
			class="flex w-full cursor-pointer items-center justify-center"
		>
			<img
				src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png"
				alt="Google Logo"
				class="mr-2 h-6"
			/>
			<span>Continue with Google</span>
		</Button>
	</div>
</div>
