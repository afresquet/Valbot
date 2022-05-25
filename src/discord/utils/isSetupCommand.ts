import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { Command, SetupCommand } from "../types/discord";

export const isSetupCommand = (
	command: Command | SetupCommand
): command is SetupCommand => {
	return command.data instanceof SlashCommandSubcommandBuilder;
};
