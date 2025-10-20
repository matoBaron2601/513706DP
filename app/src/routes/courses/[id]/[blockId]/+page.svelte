<script lang="ts">
	import PageWrapper from '$lib/components/PageWrapper.svelte';
	import { page } from '$app/state';
	import { createQuery } from '@tanstack/svelte-query';
	import getCourseBlockConcepts from './_clientServices/getCourseBlockConcepts';
	import getNextQuiz from './_clientServices/getNextQuiz';

	const courseId = page.params.id;
	const courseBlockId = page.params.courseBlockId;

	const getNextQuizQuery = createQuery({
		queryKey: ['nextQuiz', courseBlockId],
		queryFn: async () => await getNextQuiz(courseBlockId ?? '')
	});
	const getConceptsQuery = createQuery({
		queryKey: ['getCourseBlockConcepts', courseBlockId],
		queryFn: async () => await getCourseBlockConcepts(courseBlockId ?? '')
	});
</script>

<PageWrapper>
	<div class="flex flex-col gap-4">
		<h1 class="text-xl font-bold">This block consists of the following concepts:</h1>
		{#each $getConceptsQuery.data as concept}
			<p>{concept.name}</p>
		{/each}

		<h2 class="mt-6 text-lg font-semibold">Quiz Questions:</h2>
		{#if $getNextQuizQuery.data}
			{#each $getNextQuizQuery.data as question}
				<div class="mb-4">
					<h3 class="font-medium">{question.questionText}</h3>
					<ul>
						{#each question.options as option}
							<li>{option.optionText}</li>
						{/each}
					</ul>
				</div>
			{/each}
		{:else if $getNextQuizQuery.isLoading}
			<p>Loading quiz questions...</p>
		{:else}
			<p>No questions available.</p>
		{/if}
	</div>
</PageWrapper>
