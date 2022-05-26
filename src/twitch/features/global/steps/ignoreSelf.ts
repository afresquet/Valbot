import { TwitchEventPipeline } from "../../../lib";
import { ClientEventsContext } from "../../../types/twitch";

export const ignoreSelf: TwitchEventPipeline.Function<
	"message",
	ClientEventsContext["message"],
	void
> = (_, { self }, { Errors }) => {
	if (self) {
		throw new Errors.Exit();
	}
};
