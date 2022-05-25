import TwitchPipeline, { TwitchEventPipeline } from "../../../lib";
import { getCommand } from "./getCommand";

export const commandExists: TwitchEventPipeline.Command.Function<
	string[],
	boolean
> = new TwitchPipeline.Command<string[]>()
	.pipe(getCommand)
	.pipe(command => command !== undefined)
	.compose();
