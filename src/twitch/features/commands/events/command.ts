import TwitchPipeline from "../../../lib";
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
	execute: new TwitchPipeline.Command()
		.tap(ignoreSelf)
		.pipe(checkPrefix)
		.pipe(splitString(2))
		.ifelse(commandExists, executeCommand, executeDBCommand)
		.compose(),
};

export default messageEvent;
