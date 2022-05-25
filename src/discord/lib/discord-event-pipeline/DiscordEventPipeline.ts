import { Pipeline } from "typepipe";
import { Context } from "../../../types/Context";
import { ClientEventsContext } from "../../types/discord";
import { DiscordEventPipeline } from "./discord-event-pipeline";

export default class DiscordEventPipelineBuilder<
	Event extends keyof ClientEventsContext,
	Value = ClientEventsContext[Event]
> extends Pipeline<Value, ClientEventsContext[Event], Context> {
	static CommandInteraction = class DiscordCommandInteractionPipelineBuilder<
		Value = DiscordEventPipeline.CommandInteraction.Event
	> extends Pipeline<
		Value,
		DiscordEventPipeline.CommandInteraction.Event,
		Context
	> {};
}
