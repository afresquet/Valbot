import TMI from "tmi.js";
import * as features from "./features";

export default (prod, logger, TWITCH_BOT_PASSWORD) => {
	const client = new TMI.client({
		options: { debug: false },
		connection: {
			secure: true,
			reconnect: true
		},
		identity: {
			username: "valaxor_bot",
			password: `oauth:${TWITCH_BOT_PASSWORD}`
		},
		channels: ["valaxor_"]
	});

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
		client.action(client.opts.channels[0], "is online! valaxoSmile");

		client.logToDiscord({ description: "I logged in to Twitch!" });
	});

	Object.values(features).forEach(feature => {
		feature(client);
	});

	return client;
};
