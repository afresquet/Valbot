import TwitchPipeline, { TwitchEventPipeline } from "../../../lib";
import { TwitchErrors } from "../../../utils/TwitchErrors";
import { getCommand } from "./getCommand";

export const executeCommand: TwitchEventPipeline.Command.Function<
	string[],
	Promise<void>
> = new TwitchPipeline.Command<string[]>()
	.pipe(getCommand)
	.assert(() => new TwitchErrors.Exit())
	.pipe(async (command, event, context) => {
		await command.execute(event, event, context);
	})
	.compose();
