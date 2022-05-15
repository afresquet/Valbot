import { TwitchEventPipeline } from "../../../lib/twitch-event-pipeline";

export const say: TwitchEventPipeline.Function<
	"message",
	string,
	Promise<void>
> = async (message, { channel }, { twitch }) => {
	await twitch.say(channel, message);
};
