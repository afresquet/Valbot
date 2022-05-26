import TwitchPipeline, { TwitchTypePipe } from "../../../lib";
import { getCommand } from "./getCommand";

export const commandExists: TwitchTypePipe.Command.Function<string[], boolean> =
	new TwitchPipeline.Command<string[]>()
		.pipe(getCommand)
		.pipe(command => command !== undefined)
		.compose();
