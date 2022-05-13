import { TwitchEventPipeline } from "../../../lib/twitch-event-pipeline";
import { ICommand } from "../schemas/Command";

export const extractCommand: TwitchEventPipeline.Command.Step<
	string[],
	ICommand
> = ([, , command, message], { channel }) => {
	const name = command.startsWith("!") ? command.substring(1) : command;

	return { channel, name, message };
};
