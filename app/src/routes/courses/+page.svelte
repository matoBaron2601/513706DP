<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button/index.js';
	import { createQuery } from '@tanstack/svelte-query';
	import getCourses from './clientServices/getCourses';

	const getCoursesQuery = createQuery({
		queryKey: ['courses'],
		queryFn: async () => await getCourses()
	});
</script>

<div class="flex flex-col gap-4">
	{#each $getCoursesQuery.data as course}
		<Button class="cursor-pointer" onclick={() => goto(`/courses/${course.id}`)}>
			<div>{course.creatorId}</div>
			<div>{course.name}</div>
		</Button>
	{/each}
	<Button class="mt-20" onclick={() => goto('/courses/create')}>Create Course</Button>
</div>
