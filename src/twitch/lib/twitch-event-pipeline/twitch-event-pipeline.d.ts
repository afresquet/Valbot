import { TypePipe } from "typepipe";
import { Context } from "../../../types/Context";
import { ClientEventsContext } from "../../types/twitch";

export declare namespace TwitchEventPipeline {
	interface Function<Event extends keyof ClientEventsContext, Value, Result>
		extends TypePipe.Function<
			Value,
			Result,
			ClientEventsContext[Event],
			Context
		> {
		(value: Value, event: ClientEventsContext[Event], context: Context):
			| Result
			| Promise<Result>;
	}

	export namespace Command {
		type Event = ClientEventsContext["message"];

		type Function<Value = Event, Result = void> = TypePipe.Function<
			Value,
			Result,
			Event,
			Context
		>;
	}
}
