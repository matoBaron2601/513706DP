<script lang="ts">
	import { page } from '$app/state';
	const userQuizId = page.params.id ?? '';
</script>

<div>{userQuizId}</div>
