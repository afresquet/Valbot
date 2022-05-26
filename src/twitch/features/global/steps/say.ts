import { TwitchTypePipe } from "../../../lib";

export const say: TwitchTypePipe.Function<
	"message",
	string,
	Promise<void>
> = async (message, { channel }, { twitch }) => {
	await twitch.say(channel, message);
};
