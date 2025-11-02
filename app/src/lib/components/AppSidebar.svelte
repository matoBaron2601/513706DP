<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { page } from '$app/state';
	import { signOut } from '@auth/sveltekit/client';

	import { House, Columns3CogIcon, PlusIcon } from '@lucide/svelte';
	import Button from './ui/button/button.svelte';
	import logo from './logo.png';
	const items = [
		{
			title: 'Home',
			url: '/',
			icon: House
		},
		{
			title: 'Courses',
			url: '/courses',
			icon: Columns3CogIcon
		},
		{
			title: 'Create Course',
			url: '/courses/create',
			icon: PlusIcon
		}
		// {
		// 	title: 'Home',
		// 	url: '/',
		// 	icon: House
		// },
		// {
		// 	title: 'Default Datasets',
		// 	url: '/dataset/default',
		// 	icon: FolderCog
		// },
		// {
		// 	title: 'Custom Datasets',
		// 	url: '/dataset/custom',
		// 	icon: Columns3CogIcon
		// },
		// {
		// 	title: 'My quizzes',
		// 	url: '/quiz/created',
		// 	icon: PersonStandingIcon
		// },
		// {
		// 	title: 'Quiz history',
		// 	url: '/quiz/history',
		// 	icon: LucideHistory
		// },
		// {
		// 	title: 'Create quiz',
		// 	url: '/quiz/create',
		// 	icon: PlusIcon
		// }
	];
</script>

<Sidebar.Root class="border border-gray-100">
	<Sidebar.Content class="h-full border border-gray-100 bg-gray-100">
		<a href="/">
			<img src={logo} alt="Owl mascot" class="translate-2 h-20 w-20 rounded-full object-cover" /></a
		>
		<Sidebar.Group class="mt-5 flex h-full flex-col justify-between">
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each items as item (item.title)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton class="text-black hover:bg-[#f8e8d2] hover:shadow-md">
								{#snippet child({ props })}
									<a href={item.url} {...props}>
										<item.icon />
										<span >{item.title}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
			<Sidebar.Footer>
				<div class="flex items-center">
					<img
						src={page.data.session?.user?.image}
						alt="Google Logo"
						class="mr-2 h-8 w-8 rounded-2xl"
					/>
					<div>
						<p>{page.data.session?.user?.name}</p>
						<p class="text-muted-foreground text-sm">{page.data.session?.user?.email}</p>
					</div>
				</div>
				<Button onclick={signOut} variant="outline" size="sm" class="w-full cursor-pointer"
					>Sign out</Button
				>
			</Sidebar.Footer>
		</Sidebar.Group>
	</Sidebar.Content>
</Sidebar.Root>
