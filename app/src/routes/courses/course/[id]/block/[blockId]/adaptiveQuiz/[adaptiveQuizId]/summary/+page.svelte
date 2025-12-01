<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { page } from '$app/state';
	import Spinner from '$lib/components/Spinner.svelte';
	import PageWrapper from '$lib/components/PageWrapper.svelte';
	import getBlockById from '../../../../../../../../_clientServices/getBlockById';
	import getCourseById from '../../../../../../../../_clientServices/getCourseById';
	import getComplexAdaptiveQuizById from '../_clientServices/getAdaptiveQuizById';
	import Summary from '../_components/Summary.svelte';
	const courseId = page.params.id ?? '';
	const blockId = page.params.blockId ?? '';
	const adaptiveQuizId = page.params.adaptiveQuizId ?? '';

	const adaptiveQuizQuery = createQuery({
		queryKey: ['adaptiveQuiz', adaptiveQuizId],
		queryFn: async () => await getComplexAdaptiveQuizById(adaptiveQuizId)
	});

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
			text: `History`,
			href: `/courses/course/${page.params.id}/block/${page.params.blockId}/history`
		},
		{
			text: `Adaptive Quiz v${$adaptiveQuizQuery.data?.version}`,
			isCurrent: true
		}
	]}
	goBackUrl={`/courses/course/${page.params.id}/block/${page.params.blockId}/adaptiveQuiz/${adaptiveQuizId}`}
>
	{#if $adaptiveQuizQuery.isLoading}
		<Spinner />
	{:else if $adaptiveQuizQuery.data}
		<Summary complexAdaptiveQuiz={$adaptiveQuizQuery.data} />
	{/if}
</PageWrapper>
