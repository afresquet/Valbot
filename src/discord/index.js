const Discord = require("discord.js");
const features = require("./features");

module.exports = function createDiscordClient() {
	const client = new Discord.Client();

	client.on("ready", () => {
		console.log(`Logged in as ${client.user.tag}!`);
	});

	features.rawMessageHandler(client);

	features.suggestions(client);

	features.roles(client);

	return client;
};
