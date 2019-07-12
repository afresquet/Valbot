import TMI from "tmi.js";
import * as features from "./features";

const fetchChannels = async db => {
	const channelsDoc = await db
		.collection("settings")
		.doc("twitch-channels")
		.get();

	return channelsDoc.data().channels;
};

export default async (db, logger, prod, credentials) => {
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

	client.logToDiscord = (content, error) =>
		logger(
			{
				author: {
					name: "Twitch",
					icon_url:
						"https://seeklogo.com/images/T/twitch-tv-logo-51C922E0F0-seeklogo.com.png"
				},
				color: "#473978",
				thumbnail:
					"https://seeklogo.com/images/T/twitch-tv-logo-51C922E0F0-seeklogo.com.png",
				...content
			},
			error
		);

	client.on("connected", () => {
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
