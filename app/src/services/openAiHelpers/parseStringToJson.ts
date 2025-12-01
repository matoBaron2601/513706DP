export const parseStringToJson = (string: string): any | null => {
	try {
		return JSON.parse(string);
	} catch (error) {
		return null;
	}
};
