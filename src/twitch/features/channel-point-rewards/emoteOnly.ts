import { prefixChannelReward } from "../../../helpers/prefixString";
import { useState } from "../../../helpers/useState";
import { TwitchFeature } from "../../../types/Feature";
import { PubSubListener } from "../../../types/PubSubListener";
import { logTwitchError } from "../../tools/twitchEventErrorHandler";

export const emoteOnly: TwitchFeature = twitch => {
	const [active, setActive] = useState(false);
	const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

	const listener: PubSubListener = async (
		channel,
		userstate,
		redemption,
		self
	) => {
		if (
			redemption.rewardName !==
			prefixChannelReward("Emote only mode for a minute")
		)
			return;

		try {
			if (active()) throw "already_emote_only_on";

			await twitch.emoteonly(channel);
		} catch (error) {
			if (error === "already_emote_only_on") {
				await twitch.say(
					channel,
					`@${userstate.name}, emote only mode is already enabled, you fool!`
				);

				// This means the error comes from the api call
				if (!active()) {
					setActive(() => true);
				}

				return;
			} else if (error === "No response from Twitch.") {
				// For whatever reason this error means
				// "it worked, but we are going to complain about repeated calls" 🤷🏻‍♂️
			} else {
				throw error;
			}
		}

		const id = setTimeout(async () => {
			try {
				setTimeoutId(() => null);

				await twitch.emoteonlyoff(channel);
			} catch (error) {
				if (error === "already_emote_only_off") {
					if (active()) {
						setActive(() => false);
					}
				} else if (error === "No response from Twitch.") {
					// For whatever reason this error means
					// "it worked, but we are going to complain about repeated calls" 🤷🏻‍♂️
				} else {
					logTwitchError(error, "pubsub", [
						channel,
						userstate,
						redemption,
						self,
					]);

					await twitch.say(
						channel,
						"An error ocurred, check the logs on Discord!"
					);
				}
			}
		}, 60 * 1000);

		setTimeoutId(() => id);
	};
	twitch.on("pubsub" as any, listener);

	twitch.on("emoteonly", (_, enabled) => {
		const id = timeoutId();

		if (!enabled && id !== null) {
			clearTimeout(id);

			setTimeoutId(() => null);
		}

		setActive(() => enabled);
	});
};
