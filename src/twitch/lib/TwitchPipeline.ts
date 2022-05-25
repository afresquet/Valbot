import { Pipeline } from "typepipe";
import { Context } from "../../types/Context";
import { ClientEventsContext } from "../types/twitch";
import { TwitchTypePipe } from "./twitch-pipeline";

export default class TwitchPipeline<
	Event extends keyof ClientEventsContext,
	Value = ClientEventsContext[Event]
> extends Pipeline<Value, Value, ClientEventsContext[Event], Context> {
	static Command = class TwitchCommandPipelineBuilder<
		Value = TwitchTypePipe.Command.Event
	> extends Pipeline<Value, TwitchTypePipe.Command.Event, Context> {};
}
