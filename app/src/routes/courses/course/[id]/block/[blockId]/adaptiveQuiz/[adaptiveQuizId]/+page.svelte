<script lang="ts">
	import { page } from '$app/state';
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import getComplexAdaptiveQuizById from './_clientServices/getAdaptiveQuizById';
	import PageWrapper from '$lib/components/PageWrapper.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import Question from './_components/Question.svelte';
	import { type PageData } from './$types';
	import type { SubmitAdaptiveQuizAnswer } from '../../../../../../../../schemas/adaptiveQuizAnswerSchema';
	import submitAdaptiveQuizAnswer from './_clientServices/submitAdaptiveQuizAnswer';
	import queryClient from '../../../../../../../queryClient';
	import Summary from './_components/Summary.svelte';
	import finishAdaptiveQuiz from './_clientServices/finishAdaptiveQuiz';
	import getCourseById from '../../../../../../../_clientServices/getCourseById';
	import getBlockById from '../../../../../../../_clientServices/getBlockById';

	let { data }: { data: PageData } = $props();
	const courseId = page.params.id ?? '';
	const blockId = page.params.blockId ?? '';

	let questionIndex = $state(0);
	let showSummary = $state(false);

	const adaptiveQuizId = page.params.adaptiveQuizId ?? '';

	const courseQuery = createQuery({
		queryKey: ['course'],
		queryFn: async () => await getCourseById(courseId)
	});

	const blockQuery = createQuery({
		queryKey: ['block', blockId],
		queryFn: async () => {
			return await getBlockById(blockId);
		}
	});

	const adaptiveQuizQuery = createQuery({
		queryKey: ['adaptiveQuiz', adaptiveQuizId],
		queryFn: async () => await getComplexAdaptiveQuizById(adaptiveQuizId)
	});

	const submitAdaptiveQuizAnswerMutation = createMutation({
		mutationKey: ['submitAdaptiveQuizAnswer'],
		mutationFn: async (adaptiveQuizAnswer: SubmitAdaptiveQuizAnswer) =>
			await submitAdaptiveQuizAnswer(adaptiveQuizAnswer)
	});

	const finishAdaptiveQuizMutation = createMutation({
		mutationKey: ['finishAdaptiveQuiz'],
		mutationFn: async () => await finishAdaptiveQuiz(adaptiveQuizId)
	});

	const handleSubmitQuestion = async (optionText: string, baseQuestionId: string) => {
		await $submitAdaptiveQuizAnswerMutation.mutate({
			answerText: optionText,
			baseQuestionId: baseQuestionId
		});
		await queryClient.invalidateQueries({ queryKey: ['adaptiveQuiz', adaptiveQuizId] });
		questionIndex += 1;

		if (questionIndex >= ($adaptiveQuizQuery.data?.questions.length ?? 0)) {
			showSummary = true;
			await $finishAdaptiveQuizMutation.mutateAsync();
		}
	};

	$effect(() => {
		if ($adaptiveQuizQuery.data && questionIndex === 0) {
			const unansweredQuestions = $adaptiveQuizQuery.data.questions.filter(
				(q) => q.userAnswerText === null
			);

			if (unansweredQuestions.length > 0) {
				const smallestOrderIndexQuestion = unansweredQuestions.sort(
					(a, b) => Number(a.orderIndex) - Number(b.orderIndex)
				)[0];

				questionIndex = $adaptiveQuizQuery.data.questions.findIndex(
					(q) => q.id === smallestOrderIndexQuestion.id
				);
			} else {
				showSummary = true;
			}
		}
	});
</script>

<PageWrapper
	breadcrumbItems={[
		{ text: 'Courses', href: '/courses' },
		{ text: `Course: ${$courseQuery.data?.name}`, href: `/courses/course/${page.params.id}` },
		{
			text: `Block: ${$blockQuery.data?.name}`,
			href: `/courses/course/${page.params.id}/block/${page.params.blockId}`
		},
		{
			text: `Adaptive Quiz v${$adaptiveQuizQuery.data?.version}`,
			isCurrent: true
		}
	]}
>
	{#if $adaptiveQuizQuery.isLoading}
		<Spinner />
	{:else if $adaptiveQuizQuery.data && showSummary}
		<Summary complexAdaptiveQuiz={$adaptiveQuizQuery.data} />
	{:else if $adaptiveQuizQuery.data && $adaptiveQuizQuery.data.questions}
		<Question
			index={questionIndex}
			question={$adaptiveQuizQuery.data.questions[questionIndex]}
			{handleSubmitQuestion}
			{data}
		/>
	{/if}
</PageWrapper>
