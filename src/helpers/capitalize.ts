const capitalizeWord = (string: string) =>
	string.charAt(0).toUpperCase() + string.substring(1);

export const capitalize = (string: string, all: boolean = false) => {
	return all
		? string.split(" ").map(capitalizeWord).join(" ")
		: capitalizeWord(string);
};
