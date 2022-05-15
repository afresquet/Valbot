import type { CommandInteraction } from "discord.js";
import type { TypePipe } from "typepipe";
import { Context } from "../../../types/Context";
import { ClientEventsContext } from "../../types/discord";

export declare namespace DiscordEventPipeline {
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

	export namespace CommandInteraction {
		type Event = { interaction: CommandInteraction };

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
