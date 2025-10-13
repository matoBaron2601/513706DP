<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { getUniqueDatasets } from '../../clientServices/getUniqueDatasets';
	import * as Card from '$lib/components/ui/card/index.js';
	import DatasetCard from './components/DatasetCard.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import PageWrapper from '$lib/components/PageWrapper.svelte';
	import { Dataset } from '../../types';

	const getUniqueDatasetsQuery = createQuery({
		queryKey: ['get-datasets'],
		queryFn: async () => await getUniqueDatasets(Dataset.DEFAULT)
	});
</script>

<PageWrapper>
	{#if $getUniqueDatasetsQuery.isLoading}
		<Spinner classname="h-10 w-10" />
	{:else if $getUniqueDatasetsQuery.data}
		{#each $getUniqueDatasetsQuery.data as dataset}
			<DatasetCard name={dataset.name} count={dataset.count} />
		{/each}
	{/if}
</PageWrapper>
