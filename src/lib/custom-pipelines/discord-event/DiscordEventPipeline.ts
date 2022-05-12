import { ClientEventsContext } from "../../../types/discord";
import PipelineBuilder from "../../pipeline/Pipeline";
import { DiscordEventPipeline as TDiscordEventPipeline } from "./discord-event-pipeline";

export class DiscordEventPipelineBuilder<
		T extends keyof ClientEventsContext,
		V = ClientEventsContext[T]
	>
	extends PipelineBuilder<ClientEventsContext[T], V, ClientEventsContext[T]>
	implements TDiscordEventPipeline.DiscordEventPipelineBuilder<T, V>
{
	pipe<R>(
		fn: TDiscordEventPipeline.Step<T, V, R>
	): DiscordEventPipelineBuilder<T, R> {
		return super.pipe<R>(fn) as DiscordEventPipelineBuilder<T, R>;
	}

	build(): TDiscordEventPipeline.Pipeline<T, V> {
		const composition = super.build();

		return (context: ClientEventsContext[T]) => {
			return composition(context, context);
		};
	}

	step<U, R>(): TDiscordEventPipeline.Step<T, U, R> {
		const composition = super.build() as unknown as TDiscordEventPipeline.Step<
			T,
			U,
			R
		>;

		return (value, context) => composition(value, context);
	}
}
