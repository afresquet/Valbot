import { TwitchEventPipeline } from "../../../lib";
import { ICommand } from "../schemas/Command";

export const extractCommand: TwitchEventPipeline.Command.Function<
	string[],
	ICommand
> = ([, , command, message], { channel }) => {
	const name = command.startsWith("!") ? command.substring(1) : command;

	return { channel, name, message };
};
