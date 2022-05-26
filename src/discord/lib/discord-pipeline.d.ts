import type {
	ButtonInteraction as TButtonInteraction,
	CommandInteraction as TCommandInteraction,
} from "discord.js";
import type { TypePipe } from "typepipe";
import { Context } from "../../types/Context";
import { ClientEventsContext } from "../types/discord";

export declare namespace DiscordTypePipe {
	interface Function<Event extends keyof ClientEventsContext, Value, Result>
		extends TypePipe.Function<
			Value,
			Result,
			ClientEventsContext[Event],
			Context
		> {
		(value: Value, event: ClientEventsContext[Event], context: Context): Result;
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

	export namespace ButtonInteraction {
		type Event = { interaction: TButtonInteraction };

		type Function<
			Value = unknown,
			Result = void | Promise<void>,
			ExtraContext = {}
		> = TypePipe.Function<Value, Result, Event & ExtraContext, Context>;

		type MatchFunction<
			Value,
			Result,
			ExtraContext = {},
			Async = Result extends Promise<unknown> ? true : false,
			Expected = Awaited<Result>
		> = TypePipe.MatchFunction<
			Value,
			Awaited<Result>,
			Event & ExtraContext,
			Context,
			Async,
			Expected
		>;
	}

	export namespace CommandInteraction {
		type Event = { interaction: TCommandInteraction };

		type Function<
			Value = Event,
			Result = void | Promise<void>,
			ExtraContext = {}
		> = TypePipe.Function<Value, Result, Event & ExtraContext, Context>;

		type MatchFunction<
			Value,
			Result,
			ExtraContext = {},
			Async = Result extends Promise<unknown> ? true : false,
			Expected = Awaited<Result>
		> = TypePipe.MatchFunction<
			Value,
			Awaited<Result>,
			Event & ExtraContext,
			Context,
			Async,
			Expected
		>;
	}
}
