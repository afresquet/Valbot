import { TwitchTypePipe } from "../../../lib";
import { ClientEventsContext } from "../../../types/twitch";

export const ignoreSelf: TwitchTypePipe.Function<
	"message",
	ClientEventsContext["message"],
	void
> = (_, { self }, { Errors }) => {
	if (self) {
		throw new Errors.Exit();
	}
};
