<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { page } from '$app/state';
	import getUserBlock from './_clientServices/getUserBlock';
	import { getUserByEmail } from '$lib/utils';
	import getNextAdaptiveQuiz from './_clientServices/getNextAdaptiveQuiz';
	import getBlockConcepts from './_clientServices/getBlockConcepts';

	const blockId = page.params.blockId ?? '';

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
</script>

<div class="flex gap-4">
	Concepts:
	{#each $getBlockConceptsQuery.data as concept}
		<p>{concept.name}</p>
	{/each}
</div>

<p>
	getNextQuizQuery data: {$getNextQuizQuery.data?.questions.length ?? 'No quiz found'}
</p>

{#if $getNextQuizQuery.data}
	<div>
		{#each $getNextQuizQuery.data.questions as question}
			<div class="question-container mt-10">
				<p>{question.questionText}</p>
				<ul>
					{#each question.options as option}
						<li>{option.optionText}</li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>
{:else}
	<p>No questions available</p>
{/if}