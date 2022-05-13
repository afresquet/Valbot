import { assert } from "../../../../lib/pipeline";
import TwitchEventPipelineBuilder, {
	TwitchEventPipeline,
} from "../../../lib/twitch-event-pipeline";
import { TwitchErrors } from "../../../utils/TwitchErrors";
import { getCommand } from "./getCommand";

export const executeCommand: TwitchEventPipeline.Command.Step<string[], void> =
	new TwitchEventPipelineBuilder.Command<string[]>()
		.pipe(getCommand)
		.pipe(assert(() => new TwitchErrors.Exit()))
		.pipe(async (command, event, context) => {
			await command.execute(event, event, context);
		})
		.step();
