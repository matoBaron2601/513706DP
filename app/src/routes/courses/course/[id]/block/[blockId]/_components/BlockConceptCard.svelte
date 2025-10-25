<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import type { Concept } from '../../../../../../schemas/conceptSchema';
	const { concept }: { concept: Concept } = $props();
</script>

<Card.Root>
	<Card.Content>
		{concept.name}
	</Card.Content>
</Card.Root>
