import { Pipeline as TPipeline } from "../../../lib/pipeline";
import { Context } from "../../../types/Context";
import { ClientEventsContext } from "../../types/twitch";

export declare namespace TwitchEventPipeline {
	interface Pipeline<Event extends keyof ClientEventsContext, Value, Result>
		extends TPipeline.Pipeline<
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

		type Pipeline<Value = Event, Result = void> = TPipeline.Pipeline<
			Value,
			Result,
			Event,
			Context
		>;
	}
}
