import { TwitchEventPipeline } from "../../../lib/twitch-event-pipeline";
import { Command } from "../../../types/twitch";

export const getCommand: TwitchEventPipeline.Command.Function<
	string[],
	Command | undefined
> = ([name, subcommand], _, { twitch }) =>
	twitch.commands.get(`${name}-${subcommand}`) || twitch.commands.get(name);
