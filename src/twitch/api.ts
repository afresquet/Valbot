import TwitchClient from "twitch";
import PubSubClient from "twitch-pubsub-client";
import {
	fetchTwitchClientCredentials,
	setTwitchClientCredentials,
} from "../firebase/twitchClientCredentials";

export const setupTwitchClient = async () => {
	const credentials = await fetchTwitchClientCredentials();

	return TwitchClient.withCredentials(
		process.env.TWITCH_CLIENT_ID!,
		undefined,
		credentials.scope,
		{
			clientSecret: process.env.TWITCH_CLIENT_SECRET!,
			refreshToken: credentials.refreshToken,
			expiry: credentials.expiryDate,
			onRefresh: setTwitchClientCredentials,
		}
	);
};

export const pubsub = new PubSubClient();
