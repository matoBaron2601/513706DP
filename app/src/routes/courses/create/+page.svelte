<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button/index.js';
	import { createMutation } from '@tanstack/svelte-query';
	import createCourse from './clientService.ts/createCourse';
	import { getUserFromPage } from '$lib/utils';
	import type { UserDto } from '../../../db/schema';

	const user = getUserFromPage();

	const createCourseMutation = createMutation({
		mutationKey: ['createCourse'],
		mutationFn: async () => {
			const userId : UserDto = await fetch(`/api/auth/email/${user?.email}`).then((res) => res.json());
			await createCourse({
				name: 'New Course',
				creatorId: userId.id
			});
            goto('/courses');
		}
	});
</script>

<div>
	<Button onclick={async () => await $createCourseMutation.mutateAsync()}>Create Course</Button>
</div>
