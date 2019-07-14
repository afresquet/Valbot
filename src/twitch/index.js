import TMI from "tmi.js";
import * as features from "./features";
import * as tools from "./tools";
import * as helpers from "./helpers";

const fetchChannels = async db => {
	const channelsDoc = await db
		.collection("settings")
		.doc("twitch-channels")
		.get();

	return channelsDoc.data().channels;
};

export default async (db, discord, prod, credentials) => {
	const channels = await fetchChannels(db);

	const client = new TMI.client({
		options: { debug: false },
		connection: {
			secure: true,
			reconnect: true
		},
		identity: {
			username: credentials.username,
			password: credentials.password
		},
		channels
	});

	client.db = db;
	client.prod = prod;
	client.tools = tools;
	client.discord = discord;
	client.logToDiscord = helpers.logToDiscord(discord);
	client.onEvent = helpers.onErrorHandler(client);

	client.onEvent("connected", () => {
		client.opts.channels.forEach(channel => {
			client.action(channel, "is online! valaxoSmile");
		});

		client.logToDiscord({ description: "I logged in to Twitch!" });
	});

	Object.values(features).forEach(feature => {
		feature(client);
	});

	return client;
};
