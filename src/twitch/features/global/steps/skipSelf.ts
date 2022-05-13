import { tap } from "../../../../lib/pipeline";
import { TwitchEventPipeline } from "../../../lib/twitch-event-pipeline";
import { ClientEventsContext } from "../../../types/twitch";

export const skipSelf: TwitchEventPipeline.Step<
	"message",
	ClientEventsContext["message"],
	ClientEventsContext["message"]
> = tap((_, { self }) => {
	if (self) {
		throw new Error("ExitError");
	}
});
