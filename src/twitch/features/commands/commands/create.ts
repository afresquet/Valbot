import TwitchPipeline from "../../../lib";
import { Command } from "../../../types/twitch";
import { say } from "../../global/steps/say";
import { splitString } from "../../global/steps/splitString";
import { ICommand } from "../schemas/Command";
import { createDBCommand } from "../steps/createDBCommand";
import { dbCommandExists } from "../steps/dbCommandExists";
import { extractCommand } from "../steps/extractCommand";

const createCommand: Command = {
	name: "command",
	subcommand: "add",
	execute: new TwitchPipeline.Command()
		.pipe((_, { message }) => message)
		.pipe(splitString(3))
		.pipe(extractCommand)
		.ifelse(
			dbCommandExists,
			({ name }, { userstate }) =>
				`@${userstate.username}, command ${name} already exists!`,
			new TwitchPipeline.Command<ICommand>()
				.pipe(createDBCommand)
				.pipe(
					({ name }, { userstate }) =>
						`@${userstate.username}, command "${name}" was added!`
				)
				.compose()
		)
		.pipe(say)
		.compose(),
};

export default createCommand;
