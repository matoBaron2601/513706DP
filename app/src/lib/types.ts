export const Params = {
	courses: 'courses',

} as const;

export type Params = (typeof Params)[keyof typeof Params];
