import { TwitchEventPipeline } from "../../../lib/twitch-event-pipeline";

export const checkPrefix: TwitchEventPipeline.Step<
	"message",
	unknown,
	string
> = (_, { message }) => {
	if (!message.startsWith("!")) {
		throw new Error("ExitError");
	}

	return message.substring(1);
};
