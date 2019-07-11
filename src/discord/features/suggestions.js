const isProduction = require("../../helpers/isProduction");

module.exports = client => {
	client.on("message", async message => {
		if (!isProduction) return;

		if (message.author.bot) return;

		if (message.channel.name !== "suggestions") return;

		await message.react("✅");
		await message.react("❌");
	});
};
