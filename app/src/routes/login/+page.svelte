<script lang="ts">
	const login = async () => {
		window.open('http://localhost:5173/api/login', '_self');
	};
</script>

<div class="flex h-screen items-center justify-center bg-[var(--color1)]">
	<div class="w-full max-w-md rounded-lg bg-[var(--color2)] p-6 shadow-xl">
		<h2 class="mb-4 text-center text-2xl font-bold text-[var(--color4)]">
			Welcome to OnlyDevs Quizzes
		</h2>
		<p class="mb-6 text-center text-lg text-[var(--color1)]">
			Click the button below to login using your Google account and start enjoying the benefits of
			our service.
		</p>
		<button
			on:click={login}
			class="w-full transform cursor-pointer rounded-md bg-[var(--color3)] py-4 font-medium uppercase tracking-wide text-[var(--color4)] shadow-md transition duration-200 ease-in-out hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--color3)] focus:ring-opacity-50"
		>
			Login with Google
		</button>
	</div>
</div>
