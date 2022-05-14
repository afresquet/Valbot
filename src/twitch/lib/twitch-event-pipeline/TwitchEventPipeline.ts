import Pipeline from "../../../lib/pipeline";
import { Context } from "../../../types/Context";
import { ClientEventsContext } from "../../types/twitch";
import { TwitchEventPipeline } from "./twitch-event-pipeline";

export default class TwitchEventPipelineBuilder<
	Event extends keyof ClientEventsContext,
	Value = ClientEventsContext[Event]
> extends Pipeline<Value, Value, ClientEventsContext[Event], Context> {
	static Command = class TwitchCommandPipelineBuilder<
		Value = TwitchEventPipeline.Command.Event
	> extends Pipeline<
		Value,
		Value,
		TwitchEventPipeline.Command.Event,
		Context
	> {};
}
