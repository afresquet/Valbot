import { CommandInteraction } from "discord.js";
import PipelineBuilder from "../../pipeline/Pipeline";
import { InteractionPipeline as TInteractionPipeline } from "./interaction-pipeline";

export class InteractionPipelineBuilder<V = CommandInteraction>
	extends PipelineBuilder<CommandInteraction, V, CommandInteraction>
	implements TInteractionPipeline.InteractionPipelineBuilder<V>
{
	pipe<R>(fn: TInteractionPipeline.Step<V, R>): InteractionPipelineBuilder<R> {
		return super.pipe<R>(fn) as InteractionPipelineBuilder<R>;
	}

	build(): TInteractionPipeline.Pipeline<V> {
		const composition = super.build();

		return interaction => composition(interaction, interaction);
	}

	step<T, R>(): TInteractionPipeline.Step<T, R> {
		const composition = super.build() as unknown as TInteractionPipeline.Step<
			T,
			R
		>;

		return (value, context) => composition(value, context);
	}
}
