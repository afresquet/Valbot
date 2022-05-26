import TwitchPipeline, { TwitchTypePipe } from "../../../lib";
import { getCommand } from "./getCommand";

export const executeCommand: TwitchTypePipe.Command.Function<
	string[],
	Promise<void>
> = new TwitchPipeline.Command<string[]>()
	.pipe(getCommand)
	.assert((_, __, { Errors }) => new Errors.Exit())
	.pipe(async (command, event, context) => {
		await command.execute(event, event, context);
	})
	.compose();
