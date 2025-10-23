<script lang="ts">
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import { page } from '$app/state';
	import getUserBlock from './_clientServices/getUserBlock';
	import { getUserByEmail } from '$lib/utils';
	import getNextAdaptiveQuiz from './_clientServices/getNextAdaptiveQuiz';
	import getBlockConcepts from './_clientServices/getBlockConcepts';
	import PageWrapper from '$lib/components/PageWrapper.svelte';
	import Question from './_components/Question.svelte';
	import submitAdaptiveQuizAnswer from './_clientServices/submitAdaptiveQuizAnswer';
	import type { CreateAdaptiveQuizAnswer, SubmitAdaptiveQuizAnswer } from '../../../../../schemas/adaptiveQuizAnswerSchema';
	const blockId = page.params.blockId ?? '';

	let questionIndex = $state(0);

	const getUserBlockQuery = createQuery({
		queryKey: ['userBlock', blockId],
		queryFn: async () => {
			const user = await getUserByEmail(page.data.session?.user?.email ?? '');
			return await getUserBlock({ userId: user.id, blockId });
		}
	});

	const getBlockConceptsQuery = createQuery({
		queryKey: ['blockConcepts', blockId],
		queryFn: async () => await getBlockConcepts(blockId)
	});

	const getNextQuizQuery = createQuery({
		queryKey: ['nextQuiz', blockId],
		queryFn: async () => await getNextAdaptiveQuiz($getUserBlockQuery.data.id)
	});

	const submitAdaptiveQuizAnswerMutation = createMutation({
		mutationKey: ['submitAdaptiveQuizAnswer'],
		mutationFn: async (adaptiveQuizAnswer: SubmitAdaptiveQuizAnswer) =>
			await submitAdaptiveQuizAnswer(adaptiveQuizAnswer)
	});

	const handleSubmitQuestion = async (
		optionText: string,
		isCorrect: boolean,
		baseQuestionId: string
	) => {
		await new Promise((resolve) => setTimeout(resolve, 300));
		questionIndex += 1;
		await $submitAdaptiveQuizAnswerMutation.mutateAsync({
			answerText: optionText,
			baseQuestionId: baseQuestionId,
		});
	};
</script>

<PageWrapper
	><div class="flex gap-4">
		{#each $getBlockConceptsQuery.data as concept}
			<p>{concept.name}</p>
		{/each}
	</div>

	{#if $getNextQuizQuery.data}
		<div>
			<div class="question-container mt-10">
				<Question
					index={questionIndex}
					question={$getNextQuizQuery.data.questions[questionIndex]}
					{handleSubmitQuestion}
				/>
			</div>
		</div>
	{:else}
		<p>No questions available</p>
	{/if}</PageWrapper
>
