import { TwitchTypePipe } from "../../../lib";
import { Command } from "../../../types/twitch";

export const getCommand: TwitchTypePipe.Command.Function<
	string[],
	Command | undefined
> = ([name, subcommand], _, { twitch }) =>
	twitch.commands.get(`${name}-${subcommand}`) || twitch.commands.get(name);
