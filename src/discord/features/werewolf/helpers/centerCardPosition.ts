export const centerCardPosition = (index: number) => {
	if (index === 0) return "Left";
	else if (index === 1) return "Middle";
	else if (index === 2) return "Right";
	else throw new Error(`Invalid center card index: ${index}`);
};
