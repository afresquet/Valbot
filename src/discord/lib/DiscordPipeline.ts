import { Pipeline } from "typepipe";
import { Context } from "../../types/Context";
import { ClientEventsContext } from "../types/discord";
import { DiscordTypePipe } from "./discord-pipeline";

export default class DiscordPipeline<
	Event extends keyof ClientEventsContext,
	Value = unknown
> extends Pipeline<Value, ClientEventsContext[Event], Context> {
	static CommandInteraction = class CommandInteraction<
		Value = DiscordTypePipe.CommandInteraction.Event
	> extends Pipeline<
		Value,
		DiscordTypePipe.CommandInteraction.Event,
		Context
	> {};
}
