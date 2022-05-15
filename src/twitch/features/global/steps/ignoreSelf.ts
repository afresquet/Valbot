import { tap } from "typepipe/dist/steps";
import { TwitchEventPipeline } from "../../../lib/twitch-event-pipeline";
import { ClientEventsContext } from "../../../types/twitch";
import { TwitchErrors } from "../../../utils/TwitchErrors";

export const ignoreSelf: TwitchEventPipeline.Function<
	"message",
	ClientEventsContext["message"],
	ClientEventsContext["message"]
> = tap((_, { self }) => {
	if (self) {
		throw new TwitchErrors.Exit();
	}
});
