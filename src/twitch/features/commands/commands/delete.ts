import { ifelse } from "../../../../lib/pipeline";
import TwitchEventPipelineBuilder from "../../../lib/twitch-event-pipeline";
import { Command } from "../../../types/twitch";
import { say } from "../../global/steps/say";
import { splitString } from "../../global/steps/splitString";
import { ICommand } from "../schemas/Command";
import { dbCommandExists } from "../steps/dbCommandExists";
import { deleteDBCommand } from "../steps/deleteCommand";
import { extractCommand } from "../steps/extractCommand";

const deleteCommand: Command = {
	name: "command",
	subcommand: "delete",
	execute: new TwitchEventPipelineBuilder.Command()
		.pipe((_, { message }) => message)
		.pipe(splitString(3))
		.pipe(extractCommand)
		.pipe<string>(
			ifelse(
				dbCommandExists,
				new TwitchEventPipelineBuilder.Command<ICommand>()
					.pipe(deleteDBCommand)
					.pipe(
						({ name }, { userstate }) =>
							`@${userstate.username}, command "${name}" was deleted!`
					)
					.step(),
				({ name }, { userstate }) =>
					`@${userstate.username}, command ${name} doesn't exist!`
			)
		)
		.pipe(say)
		.build(),
};

export default deleteCommand;
