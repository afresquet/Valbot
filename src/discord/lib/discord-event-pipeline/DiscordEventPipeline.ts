import PipelineBuilder from "../../../lib/pipeline";
import { Context } from "../../../types/Context";
import { ClientEventsContext } from "../../types/discord";
import { DiscordEventPipeline } from "./discord-event-pipeline";

export default class DiscordEventPipelineBuilder<
	Event extends keyof ClientEventsContext,
	Value = ClientEventsContext[Event]
> extends PipelineBuilder<
	ClientEventsContext[Event],
	Value,
	ClientEventsContext[Event],
	Context
> {
	static CommandInteraction = class DiscordCommandInteractionPipelineBuilder<
		Value = DiscordEventPipeline.CommandInteraction.Event
	> extends PipelineBuilder<
		Value,
		Value,
		DiscordEventPipeline.CommandInteraction.Event,
		Context
	> {};
}
