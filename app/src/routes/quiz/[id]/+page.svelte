<script lang="ts">
	import { onMount } from 'svelte';
	import QuizForm from './components/QuizForm.svelte';
	import { createMutation } from '@tanstack/svelte-query';
	import createUserQuiz from './clientServices/createUserQuiz';
	import { page } from '$app/state';
	import getUserByEmail from '../../clientServices/getUserByEmail';
	import { getUserFromPage } from '$lib/utils';

	let userQuizId = $state<string | null>(null);
	const user = getUserFromPage(page);

	const createUserQuizMutation = createMutation({
		mutationKey: ['createUserQuiz'],
		mutationFn: async () => {
			const userId = (await getUserByEmail(user?.email ?? '')).id;
			const response = await createUserQuiz(page.params.id ?? '', userId);
			return response;
		},
		onSuccess: (data) => {
			userQuizId = data.id ?? null;
		}
	});

	onMount(async () => {
		if (user) {
			await $createUserQuizMutation.mutateAsync();
		}
	});
</script>

{#if userQuizId}
	<QuizForm {userQuizId} />
{/if}
