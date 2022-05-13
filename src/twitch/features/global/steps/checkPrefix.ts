import { TwitchEventPipeline } from "../../../lib/twitch-event-pipeline";
import { TwitchErrors } from "../../../utils/TwitchErrors";

export const checkPrefix: TwitchEventPipeline.Step<
	"message",
	unknown,
	string
> = (_, { message }) => {
	if (!message.startsWith("!")) {
		throw new TwitchErrors.Exit();
	}

	return message.substring(1);
};
