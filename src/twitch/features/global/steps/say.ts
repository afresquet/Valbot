import { TwitchEventPipeline } from "../../../lib";

export const say: TwitchEventPipeline.Function<
	"message",
	string,
	Promise<void>
> = async (message, { channel }, { twitch }) => {
	await twitch.say(channel, message);
};
