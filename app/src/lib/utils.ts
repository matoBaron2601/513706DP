import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { page } from '$app/state';
import type { User } from '../schemas/userSchema';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

export const getUserFromPage = () => {
	return {
		id: page.data.session?.user?.id ?? '',
		email: page.data.session?.user?.email ?? '',
		image: page.data.session?.user?.image ?? '',
		name: page.data.session?.user?.name ?? ''
	};
};

export const getUserByEmail = async (email: string): Promise<User> => {
	const result = await fetch(`/api/auth/email/${email}`);
	return await result.json();
};

export const learningQuotes: string[] = [
	'Every mistake is a lesson in disguise.',
	'Learning to code is like learning a new language; immerse yourself!',
	'Curiosity is the fuel of innovation.',
	'The more you practice, the more confident you become!',
	'Feedback is your friend; embrace it!',
	'Discovering new concepts is the thrill of coding.',
	'Each snippet of code is a stepping stone to mastery.',
	'Remember, learning is a continuous process—never stop exploring!',
	'A problem shared is a problem solved—collaboration is key!',
	'Take small steps; progress is progress!',
	'Celebrate your small wins; they lead to big successes.',
	'Learning coding principles is like learning the rules to a game.',
	'Spent time learning is an investment in your future.',
	'Dive deep into documentation; it’s full of treasures!',
	'Make mistakes; that’s how the best programmers grow.',
	'Learning TypeScript improves your JavaScript skills!',
	'Practice makes perfect—commit to daily coding!',
	'Ask questions; every inquiry leads to understanding!',
	'The fear of failure fades with experience.',
	'Code reviews are a great learning opportunity!',
	'Stay patient; mastery takes time and perseverance.',
	'Every program you write sharpens your skills.',
	'Explore new libraries; they can broaden your skillset.',
	'Adopt a growth mindset—your abilities can improve with effort!',
	'Keep pushing your boundaries; comfort zones are for the lazy!',
	'Each challenge is a lesson, so approach it with an open mind.',
	'Learning is a marathon, not a sprint.',
	'Take breaks; your mind needs time to process new information.',
	'Coding is as much about reading as it is about writing.',
	'Participate in hackathons to boost your learning experience!',
	'Contribution to open source is a priceless learning opportunity.',
	'Writing code daily keeps your skills sharp.',
	'Be open to new ideas; innovation thrives on adaptability.',
	'Embrace constructive criticism; it leads to growth.',
	'Study the masters; their code teaches invaluable lessons.',
	'Consistency beats intensity—code a little bit every day!',
	'The best way to learn is to teach others.',
	'Learning from others’ code can spark new ideas.',
	'Explore the community—networking can lead to new insights!',
	'Set realistic goals; each small target reached is progress.',
	"Reflect on what you've learned; it solidifies knowledge.",
	'Every line of code written today adds to your future skills.',
	"Stay hungry for knowledge; there's always more to learn!",
	'Each concept you grasp opens doors to new possibilities.'
];
