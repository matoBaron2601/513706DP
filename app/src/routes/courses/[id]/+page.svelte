<script lang="ts">
	import { page } from '$app/state';
	import { createQuery } from '@tanstack/svelte-query';
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	import PageWrapper from '$lib/components/PageWrapper.svelte';
	import { Upload } from '@lucide/svelte';
	import CourseBlockCard from './_components/CourseBlockCard.svelte';
	import getBlocks from './_clientServices.ts/getBlocks';

	const courseId = page.params.id ?? '';

	const getCourseBlocksQuery = createQuery({
		queryKey: ['courseBlocks'],
		queryFn: async () => {
			return await getBlocks(courseId);
		}
	});
</script>

<PageWrapper>
	<div class="flex w-full justify-end">
		<Button
			class="cursor-pointer"
			onclick={async () => await goto(`/courses/${courseId}/createBlock`)}
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
