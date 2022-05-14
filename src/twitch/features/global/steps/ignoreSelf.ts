import { tap } from "../../../../lib/pipeline";
import { TwitchEventPipeline } from "../../../lib/twitch-event-pipeline";
import { ClientEventsContext } from "../../../types/twitch";
import { TwitchErrors } from "../../../utils/TwitchErrors";

export const ignoreSelf: TwitchEventPipeline.Pipeline<
	"message",
	ClientEventsContext["message"],
	ClientEventsContext["message"]
> = tap((_, { self }) => {
	if (self) {
		throw new TwitchErrors.Exit();
	}
});
