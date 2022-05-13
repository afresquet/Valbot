import { assert, ifelse } from "../../../../lib/pipeline";
import TwitchEventPipelineBuilder, {
	TwitchEventPipeline,
} from "../../../lib/twitch-event-pipeline";
import { Event } from "../../../types/twitch";
import { checkPrefix } from "../../global/steps/checkPrefix";
import { ignoreSelf } from "../../global/steps/ignoreSelf";
import { say } from "../../global/steps/say";
import { executeCommand } from "../steps/executeCommand";
import { getCommand } from "../steps/getCommand";

const executeDBCommand: TwitchEventPipeline.Command.Step<string, void> =
	new TwitchEventPipelineBuilder.Command<string>()
		.pipe(getCommand)
		.pipe(assert())
		.pipe(dbCommand => dbCommand.message)
		.pipe(say)
		.step();

const messageEvent: Event<"message"> = {
	name: "command",
	event: "message",
	execute: new TwitchEventPipelineBuilder.Command()
		.pipe(ignoreSelf)
		.pipe(checkPrefix)
		.pipe(message => message.split(" ")[0])
		.pipe(
			ifelse(
				(name, _, { twitch }) => twitch.commands.get(name) !== undefined,
				executeCommand,
				executeDBCommand
			)
		)
		.build(),
};

export default messageEvent;
