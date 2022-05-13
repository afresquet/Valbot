import { TwitchEventPipeline } from "../../../lib/twitch-event-pipeline";
import { CommandModel, ICommandDocument } from "../schemas/Command";

// TODO: optimize this?
export const getDBCommand: TwitchEventPipeline.Command.Step<
	string[],
	ICommandDocument | null
> = async ([name, subcommand], { channel }) => {
	let command = await CommandModel.findOne({
		channel,
		name,
		subcommand,
	});

	if (!command) {
		command = await CommandModel.findOne({
			channel,
			name,
		});
	}

	return command;
};
