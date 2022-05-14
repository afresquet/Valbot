import type { CommandInteraction } from "discord.js";
import { Pipeline as TPipeline } from "../../../lib/pipeline";
import { Context } from "../../../types/Context";
import { ClientEventsContext } from "../../types/discord";

export declare namespace DiscordEventPipeline {
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

	export namespace CommandInteraction {
		type Event = { interaction: CommandInteraction };

		type Pipeline<Value = Event, Result = void> = TPipeline.Pipeline<
			Value,
			Result,
			Event,
			Context
		>;
	}
}
