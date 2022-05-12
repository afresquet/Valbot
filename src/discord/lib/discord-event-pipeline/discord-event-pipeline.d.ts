import type { CommandInteraction } from "discord.js";
import { Pipeline } from "../../../lib/pipeline";
import { ClientEventsContext } from "../../types/discord";

export declare namespace DiscordEventPipeline {
	interface Pipeline<
		T extends keyof ClientEventsContext,
		V,
		C = ClientEventsContext[T]
	> extends Pipeline.Pipeline<C, V, C> {
		(context: C): V | Promise<V>;
	}

	interface Step<
		T extends keyof ClientEventsContext,
		V,
		R,
		C = ClientEventsContext[T]
	> extends Pipeline.Step<V, R, C> {
		(value: V, context: C): R | Promise<R>;
	}

	interface DiscordEventPipelineBuilder<
		T extends keyof ClientEventsContext,
		V = ClientEventsContext[T],
		C = ClientEventsContext[T]
	> extends Pipeline.PipelineBuilder<C, V, C> {
		pipe<R>(step: Step<T, V, R, C>): DiscordEventPipelineBuilder<T, R, C>;

		build(): Pipeline<T, V, C>;

		step<V, R>(): Step<T, V, R, C>;
	}

	export namespace CommandInteraction {
		interface Step<V, R, C = { interaction: CommandInteraction }>
			extends Pipeline.Step<V, R, C> {
			(value: V, context: C): R | Promise<R>;
		}

		interface Pipeline<V = void, C = { interaction: CommandInteraction }>
			extends Pipeline.Pipeline<C, V, C> {
			(context: C): V | Promise<V>;
		}
	}
}
