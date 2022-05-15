import { TwitchEventPipeline } from "../../../lib/twitch-event-pipeline";
import { ClientEventsContext } from "../../../types/twitch";
import { TwitchErrors } from "../../../utils/TwitchErrors";

export const ignoreSelf: TwitchEventPipeline.Function<
	"message",
	ClientEventsContext["message"],
	void
> = (_, { self }) => {
	if (self) {
		throw new TwitchErrors.Exit();
	}
};
