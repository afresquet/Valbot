import { Pipeline as TPipeline } from "../../../lib/pipeline";
import { Context } from "../../../types/Context";
import { ClientEventsContext } from "../../types/twitch";

export declare namespace TwitchEventPipeline {
	interface Pipeline<Event extends keyof ClientEventsContext, ReturnValue>
		extends TPipeline.Pipeline<
			ClientEventsContext[Event],
			ReturnValue,
			ClientEventsContext[Event],
			Context
		> {
		(
			value: ClientEventsContext[Event],
			event: ClientEventsContext[Event],
			context: Context
		): ReturnValue | Promise<ReturnValue>;
	}

	interface Step<Event extends keyof ClientEventsContext, Value, NextValue>
		extends TPipeline.Step<
			Value,
			NextValue,
			ClientEventsContext[Event],
			Context
		> {
		(value: Value, event: ClientEventsContext[Event], context: Context):
			| NextValue
			| Promise<NextValue>;
	}

	export namespace Command {
		type Event = ClientEventsContext["message"];

		type Pipeline<Value = Event, ReturnValue = void> = TPipeline.Pipeline<
			Value,
			ReturnValue,
			Event,
			Context
		>;

		type Step<Value, NextValue> = TPipeline.Step<
			Value,
			NextValue,
			Event,
			Context
		>;
	}
}
