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

	type MatchFunction<
		Event extends keyof ClientEventsContext,
		Value,
		Result,
		Async = Result extends Promise<unknown> ? true : false,
		Expected = Awaited<Result>
	> = TypePipe.MatchFunction<
		Value,
		Awaited<Result>,
		ClientEventsContext[Event],
		Context,
		Async,
		Expected
	>;

	export namespace Command {
		type Event = ClientEventsContext["message"];

		type Function<
			Value = Event,
			Result = void | Promise<void>
		> = TypePipe.Function<Value, Result, Event, Context>;

		type MatchFunction<
			Value,
			Result,
			Async = Result extends Promise<unknown> ? true : false,
			Expected = Awaited<Result>
		> = TypePipe.MatchFunction<
			Value,
			Awaited<Result>,
			Event,
			Context,
			Async,
			Expected
		>;
	}
}
