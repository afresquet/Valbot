import axios from "axios";
import { prefixCommand } from "../../helpers/prefixString";
import { TwitchFeature } from "../../types/Feature";
import { messageSplitter } from "../helpers/messageSplitter";

export const magic8Ball: TwitchFeature = twitch => {
	twitch.on("message", async (channel, userstate, message, self) => {
		if (self) return;

		if (!message.startsWith("!")) return;

		const [command, question] = messageSplitter(message, 1);

		if (!question || command !== prefixCommand("8ball")) return;

		const response: string = await axios
			.get(
				`https://8ball.delegator.com/magic/JSON/${encodeURIComponent(question)}`
			)
			.then(res => res.data.magic.answer);

		await twitch.say(
			channel,
			`@${userstate.username}, ${response.toLowerCase()}`
		);
	});
};
