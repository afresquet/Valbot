import { Pipeline as TPipeline } from "../../../lib/pipeline";
import { Context } from "../../../types/Context";
import { ClientEventsContext } from "../../types/twitch";

export declare namespace TwitchEventPipeline {
	interface Fn<Event extends keyof ClientEventsContext, Value, Result>
		extends TPipeline.Fn<Value, Result, ClientEventsContext[Event], Context> {
		(value: Value, event: ClientEventsContext[Event], context: Context):
			| Result
			| Promise<Result>;
	}

	export namespace Command {
		type Event = ClientEventsContext["message"];

		type Fn<Value = Event, Result = void> = TPipeline.Fn<
			Value,
			Result,
			Event,
			Context
		>;
	}
}
