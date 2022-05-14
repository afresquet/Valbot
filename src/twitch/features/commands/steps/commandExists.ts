import TwitchEventPipelineBuilder, {
	TwitchEventPipeline,
} from "../../../lib/twitch-event-pipeline";
import { getCommand } from "./getCommand";

export const commandExists: TwitchEventPipeline.Command.Fn<string[], boolean> =
	new TwitchEventPipelineBuilder.Command<string[]>()
		.pipe(getCommand)
		.pipe(command => command !== undefined)
		.compose();
