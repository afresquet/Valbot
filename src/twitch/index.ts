import tmi, { ExtendedClient } from "tmi.js";
import { setupHandlers } from "./handlers";

const client = tmi.client({
	options: { debug: false },
	connection: {
		secure: true,
		reconnect: true,
	},
	identity: {
		username: process.env.TWITCH_USERNAME,
		password: process.env.TWITCH_PASSWORD,
	},
	channels: ["valaxor_"],
}) as ExtendedClient;

client.commands = new Map();

client.setupHandlers = setupHandlers;

client.start = async () => {
	await client.connect();
};

export default client;
