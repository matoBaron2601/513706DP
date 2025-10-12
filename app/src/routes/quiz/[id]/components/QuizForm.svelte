<script lang="ts">
	import PageWrapper from '$lib/components/PageWrapper.svelte';
	import { page } from '$app/state';
	import { createMutation, createQuery } from '@tanstack/svelte-query';

	import Spinner from '$lib/components/Spinner.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import Question from '../../components/Question.svelte';
	import getQuizById from '../clientServices/getQuizById';
	import { quizFormSchema } from '../quizFormSchema';
	import submitAnswers from '../clientServices/submitAnswers';

	let { userQuizId }: { userQuizId: string } = $props();

	const quizId = page.params.id ?? '';
	let submitModalOpen = $state(false);

	const getQuizByIdQuery = createQuery({
		queryKey: ['quiz', quizId],
		queryFn: async () => getQuizById(quizId)
	});

	const submitAnswersMutation = createMutation({
		mutationKey: ['submitAnswers'],
		mutationFn: async () => {
			return await submitAnswers(userQuizId, { answers: $formData.answers });
		},
		onSuccess: () => {
			submitModalOpen = false;
		}
	});

	let questionIndex = $state(0);
	let maxQuestions = $derived.by(() => $getQuizByIdQuery.data?.questions.length ?? 0);

	const form = superForm(
		{ answers: [] as { questionId: string; optionId: string }[] },
		{
			validators: zodClient(quizFormSchema)
		}
	);
	const { form: formData, enhance } = form;

	const handleSubmit = async () => {
		await $submitAnswersMutation.mutateAsync();
		console.log($formData);
	};
</script>

<form method="POST" use:enhance class="p-4" onsubmit={handleSubmit}>
	<PageWrapper unknownParamText={quizId}>
		<div class="m-auto mt-12 max-w-[70%]">
			{#if $getQuizByIdQuery.isLoading}
				<Spinner />
			{:else if $getQuizByIdQuery.data && questionIndex < maxQuestions}
				<Question
					question={$getQuizByIdQuery.data.questions[questionIndex]}
					index={questionIndex}
					{formData}
				/>
			{/if}

			<div class="flex gap-4">
				{#if questionIndex > 0}
					<Button class="mt-4 cursor-pointer" onclick={() => questionIndex--}
						>Previous Question</Button
					>
				{/if}
				{#if questionIndex === maxQuestions - 1}
					<Popover.Root bind:open={submitModalOpen}>
						<Popover.Trigger class="ml-auto">
							<Button class="ml-auto mt-4 cursor-pointer bg-green-400 text-black hover:bg-green-400"
								>Submit Quiz</Button
							>
						</Popover.Trigger>
						<Popover.Content class="w-80 border bg-gray-200">
							<h1 class="font-bold">Do you want to submit the quiz?</h1>
							<div class="flex justify-between gap-2">
								<Button
									onclick={() => (submitModalOpen = false)}
									variant="outline"
									class="flex-1 cursor-pointer bg-white"
								>
									Cancel
								</Button>
								<Button
									onclick={handleSubmit}
									variant="outline"
									class="flex-1 cursor-pointer bg-green-400"
								>
									Submit
								</Button>
							</div></Popover.Content
						>
					</Popover.Root>
				{:else if questionIndex < maxQuestions - 1}
					<Button
						class="ml-auto mt-4 cursor-pointer"
						onclick={() => {
							questionIndex++;
						}}>Next Question</Button
					>
				{/if}
			</div>
		</div>
	</PageWrapper>
</form>
