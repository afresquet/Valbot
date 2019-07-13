export default (message, amount) => {
	const words = message.split(/\s+/g);

	const args = words.slice(0, amount).map(word => word.toLowerCase());

	const rest = words.slice(amount).join(" ");

	return [...args, rest];
};
