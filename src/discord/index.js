import Discord from "discord.js";
import * as features from "./features";

export default prod => {
	const client = new Discord.Client();

	client.prod = prod;

	client.on("ready", () => {
		console.log(`Logged in as ${client.user.tag}!`);
	});

	features.rawMessageHandler(client);

	features.suggestions(client);

	features.roles(client);

	return client;
};
