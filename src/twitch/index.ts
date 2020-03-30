import tmi from "tmi.js";
import { isProduction } from "../helpers/isProduction";

const identity = isProduction
	? {
			username: process.env.TWITCH_BOT_USERNAME,
			password: process.env.TWITCH_BOT_PASSWORD,
	  }
	: {
			username: process.env.TWITCH_BOT_DEV_USERNAME,
			password: process.env.TWITCH_BOT_DEV_PASSWORD,
	  };

export const twitch = tmi.client({
	options: { debug: false },
	connection: {
		secure: true,
		reconnect: true,
	},
	identity,
});
