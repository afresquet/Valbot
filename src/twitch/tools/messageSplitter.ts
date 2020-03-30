export default (message: string, amount?: number) => {
	const words = message.split(/\s+/g);

	if (!amount) {
		return words.map(word => word.toLowerCase());
	}

	const args = words.slice(0, amount).map(word => word.toLowerCase());

	const rest = words.slice(amount).join(" ");

	return [...args, rest];
};
