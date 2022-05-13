import { TwitchEventPipeline } from "../../../lib/twitch-event-pipeline";

export const say: TwitchEventPipeline.Step<"message", string, void> = async (
	message,
	{ channel },
	{ twitch }
) => {
	await twitch.say(channel, message);
};
