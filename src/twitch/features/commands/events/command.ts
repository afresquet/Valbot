import { ifelse } from "../../../../lib/pipeline";
import TwitchEventPipelineBuilder from "../../../lib/twitch-event-pipeline";
import { Event } from "../../../types/twitch";
import { checkPrefix } from "../../global/steps/checkPrefix";
import { ignoreSelf } from "../../global/steps/ignoreSelf";
import { splitString } from "../../global/steps/splitString";
import { commandExists } from "../steps/commandExists";
import { executeCommand } from "../steps/executeCommand";
import { executeDBCommand } from "../steps/executeDBCommand";

const messageEvent: Event<"message"> = {
	name: "command",
	event: "message",
	execute: new TwitchEventPipelineBuilder.Command()
		.pipe(ignoreSelf)
		.pipe(checkPrefix)
		.pipe(splitString(2))
		.pipe(ifelse(commandExists, executeCommand, executeDBCommand))
		.pipeline(),
};

export default messageEvent;
