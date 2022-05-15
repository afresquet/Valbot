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

	export namespace CommandInteraction {
		type Event = { interaction: CommandInteraction };

		type Function<Value = Event, Result = void> = TypePipe.Function<
			Value,
			Result,
			Event,
			Context
		>;
	}
}
