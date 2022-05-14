import TwitchEventPipelineBuilder, {
	TwitchEventPipeline,
} from "../../../lib/twitch-event-pipeline";
import { getCommand } from "./getCommand";

export const commandExists: TwitchEventPipeline.Command.Pipeline<
	string[],
	boolean
> = new TwitchEventPipelineBuilder.Command<string[]>()
	.pipe(getCommand)
	.pipe(command => command !== undefined)
	.done();
