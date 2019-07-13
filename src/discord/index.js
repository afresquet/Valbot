import Discord from "discord.js";
import * as features from "./features";
import * as tools from "./tools";

export default (db, prod) => {
	const client = new Discord.Client();

	client.db = db;
	client.prod = prod;

	client.log = tools.logger(client);

	client.on("ready", () => {
		console.log(`Logged in as ${client.user.tag}!`);
	});

	tools.rawMessageHandler(client);

	Object.values(features).forEach(feature => {
		feature(client);
	});

	return client;
};
