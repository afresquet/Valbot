import { CommandInteraction } from "discord.js";
import { Pipeline } from "../lib/pipeline/pipeline";

export const matchSubcommand =
	(subcommand: string) => (interaction: CommandInteraction) =>
		subcommand === interaction.options.getSubcommand();

export const matchSubcommandStep =
	(subcommand: string): Pipeline.Step<unknown, boolean, CommandInteraction> =>
	(_, interaction) =>
		matchSubcommand(subcommand)(interaction);
