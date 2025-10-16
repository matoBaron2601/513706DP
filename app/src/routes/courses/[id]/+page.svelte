<script lang="ts">
	import { page } from '$app/state';
	import { createQuery } from '@tanstack/svelte-query';
	import getCourseBlocks from './clientServices.ts/getCourseBlocks';
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	const courseId = page.params.id ?? '';

	const getCourseBlocksQuery = createQuery({
		queryKey: ['courseBlocks'],
		queryFn: async () => {
			return await getCourseBlocks(courseId);
		}
	});
</script>

<div>
	{#each $getCourseBlocksQuery.data as courseBlock}
		<div>
			<h2>Course Block ID: {courseBlock.id}</h2>
			<p>Id: {courseBlock.id}</p>
			<p>Title: {courseBlock.name}</p>
		</div>
	{/each}

	<Button class="cursor-pointer" onclick={async () => await goto(`/courses/${courseId}/createCourseBlock`)}>Go to Create Course Block page</Button>
</div>
