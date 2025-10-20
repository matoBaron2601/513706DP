<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { page } from '$app/state';
	import getUserBlock from './_clientServices/getUserBlock';
	import { userDataStore } from '$lib/stores/userDataStore';

	const courseId = page.params.id ?? '';
	const blockId = page.params.blockId ?? '';
	const userId = $userDataStore.userId;

	const getUserBlockQuery = createQuery({
		queryKey: ['userBlock', courseId, blockId],
		queryFn: async () => await getUserBlock({ userId, blockId })
	});
</script>

<p>{$getUserBlockQuery.data}</p>
