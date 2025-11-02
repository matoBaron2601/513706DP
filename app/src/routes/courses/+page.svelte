<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import getCourses from './_clientServices/getCourses';
	import CourseCard from './_components/CourseCard.svelte';
	import PageWrapper from '$lib/components/PageWrapper.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	const getCoursesQuery = createQuery({
		queryKey: ['courses'],
		queryFn: async () => await getCourses()
	});
</script>

<PageWrapper breadcrumbItems={[{ text: 'Courses', href: '/courses', isCurrent: true }]}>
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
		{#each $getCoursesQuery.data as course}
			<CourseCard {course} />
		{/each}
	</div>
</PageWrapper>
