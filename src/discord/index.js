import Discord from "discord.js";
import * as features from "./features";

export default () => {
	const client = new Discord.Client();

	client.on("ready", () => {
		console.log(`Logged in as ${client.user.tag}!`);
	});

	features.rawMessageHandler(client);

	features.suggestions(client);

	features.roles(client);

	return client;
};
