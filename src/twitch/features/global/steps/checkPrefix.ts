import { TwitchEventPipeline } from "../../../lib";
import { TwitchErrors } from "../../../utils/TwitchErrors";

export const checkPrefix: TwitchEventPipeline.Function<
	"message",
	unknown,
	string
> = (_, { message }) => {
	if (!message.startsWith("!")) {
		throw new TwitchErrors.Exit();
	}

	return message.substring(1);
};
