import TypePipe from "typepipe";
import { Context } from "../../../types/Context";
import { ClientEventsContext } from "../../types/twitch";
import { TwitchEventPipeline } from "./twitch-event-pipeline";

export default class TwitchEventPipelineBuilder<
	Event extends keyof ClientEventsContext,
	Value = ClientEventsContext[Event]
> extends TypePipe<Value, Value, ClientEventsContext[Event], Context> {
	static Command = class TwitchCommandPipelineBuilder<
		Value = TwitchEventPipeline.Command.Event
	> extends TypePipe<
		Value,
		Value,
		TwitchEventPipeline.Command.Event,
		Context
	> {};
}
