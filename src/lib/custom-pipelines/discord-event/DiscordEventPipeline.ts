import { CommandInteraction } from "discord.js";
import { ClientEventsContext } from "../../../types/discord";
import PipelineBuilder from "../../pipeline/Pipeline";
import { DiscordEventPipeline as TDiscordEventPipeline } from "./discord-event-pipeline";

export class DiscordEventPipelineBuilder<
		T extends keyof ClientEventsContext,
		V = ClientEventsContext[T],
		C = ClientEventsContext[T]
	>
	extends PipelineBuilder<C, V, C>
	implements TDiscordEventPipeline.DiscordEventPipelineBuilder<T, V, C>
{
	pipe<R>(
		fn: TDiscordEventPipeline.Step<T, V, R, C>
	): DiscordEventPipelineBuilder<T, R, C> {
		return super.pipe<R>(fn) as DiscordEventPipelineBuilder<T, R, C>;
	}

	build(): TDiscordEventPipeline.Pipeline<T, V, C> {
		const composition = super.build();

		return (context: C) => {
			return composition(context, context);
		};
	}

	step<U, R>(): TDiscordEventPipeline.Step<T, U, R, C> {
		const composition = super.build() as unknown as TDiscordEventPipeline.Step<
			T,
			U,
			R,
			C
		>;

		return (value, context) => composition(value, context);
	}

	static CommandInteraction = class DiscordCommandInteractionPipelineBuilder<
		V = { interaction: CommandInteraction },
		C = { interaction: CommandInteraction }
	> extends DiscordEventPipelineBuilder<"interactionCreate", V, C> {};
}
