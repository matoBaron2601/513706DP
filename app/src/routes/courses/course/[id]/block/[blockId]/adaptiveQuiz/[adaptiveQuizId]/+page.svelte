<script lang="ts">
	import { page } from '$app/state';
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import PageWrapper from '$lib/components/PageWrapper.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import Question from './_components/Question.svelte';
	import { type PageData } from './$types';
	import type { SubmitAdaptiveQuizAnswer } from '../../../../../../../../schemas/adaptiveQuizAnswerSchema';
	import queryClient from '../../../../../../../queryClient';
	import Summary from './_components/Summary.svelte';
	import { getBlockById } from '../../../../../../../_clientServices/getBlockById';
	import { getCourseById } from '../../../../../../../_clientServices/getCourseById';
	import { finishAdaptiveQuiz } from './_clientServices/finishAdaptiveQuiz';
	import { getComplexAdaptiveQuizById } from './_clientServices/getAdaptiveQuizById';
	import { getConceptsByBlockId } from './_clientServices/getConceptsByBlockId';
	import { submitAdaptiveQuizAnswer } from './_clientServices/submitAdaptiveQuizAnswer';

	let { data }: { data: PageData } = $props();
	const courseId = page.params.id ?? '';
	const blockId = page.params.blockId ?? '';

	let questionIndex = $state(0);
	let showSummary = $state(false);
	let questionStartTime = $state(Date.now());

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

	const conceptQuery = createQuery({
		queryKey: ['concepts'],
		queryFn: async () => await getConceptsByBlockId(blockId)
	});

	const handleSubmitQuestion = async (optionText: string, baseQuestionId: string) => {
		const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);

		questionIndex += 1;

		await $submitAdaptiveQuizAnswerMutation.mutateAsync({
			answerText: optionText,
			baseQuestionId: baseQuestionId,
			time: timeSpent,
			adaptiveQuizId: adaptiveQuizId
		});

		await queryClient.invalidateQueries({ queryKey: ['adaptiveQuiz', adaptiveQuizId] });

		if (questionIndex >= ($adaptiveQuizQuery.data?.questions.length ?? 0)) {
			showSummary = true;
			await $finishAdaptiveQuizMutation.mutateAsync();
		} else {
			questionStartTime = Date.now();
		}
	};

	$effect(() => {
		const quizData = $adaptiveQuizQuery.data;
		const conceptData = $conceptQuery.data;

		if (quizData && conceptData && questionIndex === 0) {
			const unansweredQuestions = quizData.questions.filter((q) => q.userAnswerText === null);

			if (unansweredQuestions.length > 0) {
				questionIndex = quizData.questions.findIndex((q) => q.id === unansweredQuestions[0].id);
			} else {
				showSummary = true;
			}
		}
	});

	$effect(() => {
		if ($adaptiveQuizQuery.data) {
			questionStartTime = Date.now();
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
	goBackUrl={`/courses/course/${courseId}/block/${blockId}`}
>
	{#if $adaptiveQuizQuery.isLoading}
		<Spinner />
	{:else if $adaptiveQuizQuery.data && showSummary}
		<Summary complexAdaptiveQuiz={$adaptiveQuizQuery.data} />
	{:else if $adaptiveQuizQuery.data && $adaptiveQuizQuery.data.questions && questionIndex < $adaptiveQuizQuery.data.questions.length}
		<Question
			index={questionIndex}
			question={$adaptiveQuizQuery.data.questions[questionIndex]}
			{handleSubmitQuestion}
			{data}
		/>
	{:else}
		<Spinner />
	{/if}
</PageWrapper>
