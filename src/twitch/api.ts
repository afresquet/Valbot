import tmi from "tmi.js";
import TwitchClient from "twitch";
import PubSubClient from "twitch-pubsub-client";
import PubSubRedemptionMessage from "twitch-pubsub-client/lib/Messages/PubSubRedemptionMessage";
import {
	fetchTwitchAccessToken,
	setTwitchAccessToken,
} from "../firebase/twitchClientCredentials";
import { isProduction } from "../helpers/isProduction";

export const setupTwitchClient = async () => {
	const clientId = isProduction
		? process.env.TWITCH_CLIENT_ID!
		: process.env.TWITCH_DEV_CLIENT_ID!;

	const clientSecret = isProduction
		? process.env.TWITCH_CLIENT_SECRET!
		: process.env.TWITCH_DEV_CLIENT_SECRET!;

	const credentials = await fetchTwitchAccessToken();

	return TwitchClient.withCredentials(clientId, undefined, credentials.scope, {
		clientSecret,
		refreshToken: credentials.refreshToken,
		expiry: credentials.expiryDate,
		onRefresh: setTwitchAccessToken,
	});
};

export const pubsub = new PubSubClient();

export const pubsubOnRedemption = (twitch: tmi.Client) => async (
	redemption: PubSubRedemptionMessage
) => {
	const channel = await redemption.getChannel();
	const channelName = `#${channel?.name}`;
	const userstate = await redemption.getUser();
	const self = redemption.userName === twitch.getUsername();

	twitch.emit("pubsub" as any, channelName, userstate, redemption, self);
};
