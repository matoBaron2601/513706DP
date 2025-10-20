<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { page } from '$app/state';
	import getUserBlock from './_clientServices/getUserBlock';
	import { onMount } from 'svelte';
	import { getUserByEmail } from '$lib/utils';

	const blockId = page.params.blockId ?? '';


	const getUserBlockQuery = createQuery({
		queryKey: ['userBlock', blockId],
		queryFn: async () => {
			const user = await getUserByEmail(page.data.session?.user?.email ?? '');
			return await getUserBlock({ userId: user.id, blockId });
		},
	});
</script>

<p>{$getUserBlockQuery.data}</p>
