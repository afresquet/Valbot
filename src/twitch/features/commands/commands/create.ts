import { ifelse } from "../../../../lib/pipeline";
import TwitchEventPipelineBuilder from "../../../lib/twitch-event-pipeline";
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
	execute: new TwitchEventPipelineBuilder.Command()
		.pipe((_, { message }) => message)
		.pipe(splitString(3))
		.pipe(extractCommand)
		.pipe<string>(
			ifelse(
				dbCommandExists,
				new TwitchEventPipelineBuilder.Command<ICommand>()
					.pipe(createDBCommand)
					.pipe(
						({ name }, { userstate }) =>
							`@${userstate.username}, command "${name}" was added!`
					)
					.step(),
				({ name }, { userstate }) =>
					`@${userstate.username}, command ${name} already exists!`
			)
		)
		.pipe(say)
		.build(),
};

export default createCommand;