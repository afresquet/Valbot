import TwitchClient from "twitch";
import PubSubClient from "twitch-pubsub-client";
import {
	fetchTwitchClientCredentials,
	setTwitchClientCredentials,
} from "../firebase/twitchClientCredentials";
import { isProduction } from "../helpers/isProduction";

export const setupTwitchClient = async () => {
	const clientId = isProduction
		? process.env.TWITCH_CLIENT_ID!
		: process.env.TWITCH_DEV_CLIENT_ID!;

	const clientSecret = isProduction
		? process.env.TWITCH_CLIENT_SECRET!
		: process.env.TWITCH_DEV_CLIENT_SECRET!;

	const credentials = await fetchTwitchClientCredentials();

	return TwitchClient.withCredentials(clientId, undefined, credentials.scope, {
		clientSecret,
		refreshToken: credentials.refreshToken,
		expiry: credentials.expiryDate,
		onRefresh: setTwitchClientCredentials,
	});
};

export const pubsub = new PubSubClient();
