import { ClientEventsContext } from "../../../types/discord";
import { Pipeline } from "../../pipeline/pipeline";

export declare namespace DiscordEventPipeline {
	interface Pipeline<T extends keyof ClientEventsContext, V>
		extends Pipeline.Pipeline<
			ClientEventsContext[T],
			V,
			ClientEventsContext[T]
		> {
		(context: ClientEventsContext[T]): V | Promise<V>;
	}

	interface Step<T extends keyof ClientEventsContext, V, R>
		extends Pipeline.Step<V, R, ClientEventsContext[T]> {
		(value: V, context: ClientEventsContext[T]): R | Promise<R>;
	}

	interface DiscordEventPipelineBuilder<
		T extends keyof ClientEventsContext,
		V = ClientEventsContext[T]
	> extends Pipeline.PipelineBuilder<
			ClientEventsContext[T],
			V,
			ClientEventsContext[T]
		> {
		pipe<R>(step: Step<T, V, R>): DiscordEventPipelineBuilder<T, R>;

		build(): Pipeline<T, V>;

		step<V, R>(): Step<T, V, R>;
	}
}
