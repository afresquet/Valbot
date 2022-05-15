import { CommandInteraction } from "discord.js";

export const matchSubcommand = (
	subcommand: string,
	interaction: CommandInteraction
) => subcommand === interaction.options.getSubcommand();
