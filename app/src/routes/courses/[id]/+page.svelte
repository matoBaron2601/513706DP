<script lang="ts">
	import { page } from '$app/state';
	import { createQuery } from '@tanstack/svelte-query';
	import getCourseBlocks from './_clientServices.ts/getCourseBlocks';
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	import PageWrapper from '$lib/components/PageWrapper.svelte';
	import { Upload } from '@lucide/svelte';
	import CourseBlockCard from './_components/CourseBlockCard.svelte';

	const courseId = page.params.id ?? '';

	const getCourseBlocksQuery = createQuery({
		queryKey: ['courseBlocks'],
		queryFn: async () => {
			return await getCourseBlocks(courseId);
		}
	});
</script>

<PageWrapper>
	<div class="flex w-full justify-end">
		<Button
			class="cursor-pointer"
			onclick={async () => await goto(`/courses/${courseId}/createCourseBlock`)}
		>
			<Upload />
			Create course block</Button
		>
	</div>
	<div class="mx-auto grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-4">
		{#each $getCourseBlocksQuery.data as courseBlock}
			<CourseBlockCard {courseBlock} />
		{/each}
	</div>
</PageWrapper>
