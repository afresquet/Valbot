import Discord from "discord.js";
import * as features from "./features";
import * as tools from "./tools";

export default prod => {
	const client = new Discord.Client();

	client.prod = prod;

	client.on("ready", () => {
		console.log(`Logged in as ${client.user.tag}!`);
	});

	tools.rawMessageHandler(client);

	Object.values(features).forEach(feature => {
		feature(client);
	});

	return client;
};
