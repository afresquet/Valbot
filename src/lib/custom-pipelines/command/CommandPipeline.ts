import { CommandInteraction } from "discord.js";
import PipelineBuilder from "../../pipeline/Pipeline";
import { CommandPipeline as TCommandPipeline } from "./command-pipeline";

export class CommandPipelineBuilder<V = CommandInteraction>
	extends PipelineBuilder<CommandInteraction, V, CommandInteraction>
	implements TCommandPipeline.CommandPipelineBuilder<V>
{
	pipe<R>(fn: TCommandPipeline.Step<V, R>): CommandPipelineBuilder<R> {
		return super.pipe<R>(fn) as CommandPipelineBuilder<R>;
	}

	build(): TCommandPipeline.Pipeline<V> {
		const composition = super.build();

		return interaction => composition(interaction, interaction);
	}

	step<T, R>(): TCommandPipeline.Step<T, R> {
		const composition = super.build() as unknown as TCommandPipeline.Step<T, R>;

		return (value, context) => composition(value, context);
	}
}
