import { fetchPyramid } from "../../../firebase/fetchPyramid";
import { prefixChannelReward } from "../../../helpers/prefixString";
import { State } from "../../../helpers/State";
import { TwitchFeature } from "../../../types/Feature";
import { PubSubListener } from "../../../types/PubSubListener";
import { logTwitchError } from "../../helpers/twitchEventErrorHandler";

export const emoteOnly: TwitchFeature = twitch => {
	const active = new State(false);
	const timeoutId = new State<NodeJS.Timeout | null>(null);

	const makePyramid = async (channel: string) => {
		const pyramid = await fetchPyramid();

		if (!pyramid) return;

		const { emote, length } = pyramid;

		for (let i = 1; i <= length + length - 1; i++) {
			const times = i - (i > length ? (i % length) * 2 : 0);

			await twitch.say(channel, `${emote} `.repeat(times));
		}
	};

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
			if (active.current) throw "already_emote_only_on";

			await twitch.emoteonly(channel);

			await makePyramid(channel);
		} catch (error) {
			if (error === "already_emote_only_on") {
				await twitch.say(
					channel,
					`@${userstate.name}, emote only mode is already enabled, you fool!`
				);

				// This means the error comes from the api call
				if (!active.current) {
					active.set(() => true);
				}

				return;
			} else if (error === "No response from Twitch.") {
				// For whatever reason this error means
				// "it worked, but we are going to complain about repeated calls" 🤷🏻‍♂️
				await makePyramid(channel);
			} else {
				throw error;
			}
		}

		const id = setTimeout(async () => {
			try {
				timeoutId.set(() => null);

				await twitch.emoteonlyoff(channel);

				await twitch.say(channel, "FREEDOM! widepeepoHappy");
			} catch (error) {
				if (error === "already_emote_only_off") {
					if (active.current) {
						active.set(() => false);
					}
				} else if (error === "No response from Twitch.") {
					// For whatever reason this error means
					// "it worked, but we are going to complain about repeated calls" 🤷🏻‍♂️
					await twitch.say(channel, "FREEDOM! widepeepoHappy");
				} else {
					await logTwitchError(error, "pubsub", [
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

		timeoutId.set(() => id);
	};
	twitch.on("pubsub" as any, listener);

	twitch.on("emoteonly", (_, enabled) => {
		const id = timeoutId.current;

		if (!enabled && id !== null) {
			clearTimeout(id);

			timeoutId.set(() => null);
		}

		active.set(() => enabled);
	});
};
