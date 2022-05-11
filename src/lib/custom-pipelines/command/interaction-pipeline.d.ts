import type { CommandInteraction } from "discord.js";
import { Pipeline } from "../../pipeline/pipeline";

export declare namespace InteractionPipeline {
	interface Pipeline<V> {
		(interaction: CommandInteraction): V | Promise<V>;
	}

	interface Step<V, R> extends Pipeline.Step<V, R, CommandInteraction> {
		(value: V, context: CommandInteraction): R | Promise<R>;
	}

	interface InteractionPipelineBuilder<V>
		extends Pipeline.PipelineBuilder<
			CommandInteraction,
			V,
			CommandInteraction
		> {
		fns: Step<any | Promise<any>, any | Promise<any>>[];

		pipe<R>(step: Step<V, R>): InteractionPipelineBuilder<R>;

		build(): Pipeline<V>;

		step<V, R>(): Step<V, R>;
	}
}
