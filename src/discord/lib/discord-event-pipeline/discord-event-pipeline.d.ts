import type { CommandInteraction } from "discord.js";
import { Pipeline as TPipeline } from "../../../lib/pipeline";
import { Context } from "../../../types/Context";
import { ClientEventsContext } from "../../types/discord";

export declare namespace DiscordEventPipeline {
	interface Fn<Event extends keyof ClientEventsContext, Value, Result>
		extends TPipeline.Fn<Value, Result, ClientEventsContext[Event], Context> {
		(value: Value, event: ClientEventsContext[Event], context: Context):
			| Result
			| Promise<Result>;
	}

	export namespace CommandInteraction {
		type Event = { interaction: CommandInteraction };

		type Fn<Value = Event, Result = void> = TPipeline.Fn<
			Value,
			Result,
			Event,
			Context
		>;
	}
}
