import isProduction from "../../helpers/isProduction";

export default client => {
	const yes = "✅";
	const no = "❌";

	client.on("message", async message => {
		if (!isProduction) return;

		if (message.author.bot) return;

		if (message.channel.name !== "suggestions") return;

		await message.react(yes);
		await message.react(no);
	});

	client.on("messageReactionAdd", (reaction, user) => {
		if (!isProduction) return;

		if (user.bot) return;

		if (reaction.message.channel.name !== "suggestions") return;

		const emoji = reaction.emoji.name;

		if (emoji !== yes && emoji !== no) return;

		const oppositeEmoji = emoji === yes ? no : yes;

		const oppositeReaction = reaction.message.reactions.get(oppositeEmoji);

		const hasUserReactedToOpposite = oppositeReaction.users.find(
			u => u.id === user.id
		);

		if (hasUserReactedToOpposite) {
			oppositeReaction.remove(user.id);
		}
	});
};
