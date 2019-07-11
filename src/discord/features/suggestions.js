import isProduction from "../../helpers/isProduction";

export default client => {
	client.on("message", async message => {
		if (!isProduction) return;

		if (message.author.bot) return;

		if (message.channel.name !== "suggestions") return;

		await message.react("✅");
		await message.react("❌");
	});
};
