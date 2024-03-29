import TwitchPipeline from "../../../lib";
import { Command } from "../../../types/twitch";
import { say } from "../../global/steps/say";
import { splitString } from "../../global/steps/splitString";
import { ICommand } from "../schemas/Command";
import { dbCommandExists } from "../steps/dbCommandExists";
import { editDBCommand } from "../steps/editDBCommand";
import { extractCommand } from "../steps/extractCommand";

const editCommand: Command = {
	name: "command",
	subcommand: "edit",
	execute: new TwitchPipeline.Command()
		.pipe((_, { message }) => message)
		.pipe(splitString(3))
		.pipe(extractCommand)
		.ifelse(
			dbCommandExists,
			new TwitchPipeline.Command<ICommand>()
				.pipe(editDBCommand)
				.pipe(
					({ name }, { userstate }) =>
						`@${userstate.username}, command "${name}" was edited!`
				)
				.compose(),
			({ name }, { userstate }) =>
				`@${userstate.username}, command ${name} doesn't exist!`
		)
		.pipe(say)
		.compose(),
};

export default editCommand;
