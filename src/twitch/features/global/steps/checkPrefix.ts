import { TwitchEventPipeline } from "../../../lib";

export const checkPrefix: TwitchEventPipeline.Function<
	"message",
	unknown,
	string
> = (_, { message }, { Errors }) => {
	if (!message.startsWith("!")) {
		throw new Errors.Exit();
	}

	return message.substring(1);
};
