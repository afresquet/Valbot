import tmi from "tmi.js";
import { isProduction } from "../helpers/isProduction";
import { twitchEventErrorHandler } from "./tools/twitchEventErrorHandler";

const identity = isProduction
	? {
			username: process.env.TWITCH_BOT_USERNAME,
			password: process.env.TWITCH_BOT_PASSWORD,
	  }
	: {
			username: process.env.TWITCH_BOT_DEV_USERNAME,
			password: process.env.TWITCH_BOT_DEV_PASSWORD,
	  };

const client = tmi.client({
	options: { debug: false },
	connection: {
		secure: true,
		reconnect: true,
	},
	identity,
});

client.on = twitchEventErrorHandler(client);

export const twitch = client;
