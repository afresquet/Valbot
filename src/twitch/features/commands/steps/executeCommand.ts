import { assert } from "../../../../lib/pipeline";
import TwitchEventPipelineBuilder, {
	TwitchEventPipeline,
} from "../../../lib/twitch-event-pipeline";
import { getCommand } from "./getCommand";

export const executeCommand: TwitchEventPipeline.Command.Step<string[], void> =
	new TwitchEventPipelineBuilder.Command<string[]>()
		.pipe(getCommand)
		.pipe(assert())
		.pipe(async (command, event, context) => {
			await command.execute(event, event, context);
		})
		.step();
