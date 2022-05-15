import { CommandInteraction } from "discord.js";
import { DiscordEventPipeline } from "../lib/discord-event-pipeline";

export const matchSubcommand =
	(subcommand: string) => (interaction: CommandInteraction) =>
		subcommand === interaction.options.getSubcommand();

export const matchSubcommandStep =
	<Value>(
		subcommand: string
	): DiscordEventPipeline.CommandInteraction.Function<Value, boolean> =>
	(_, { interaction }) =>
		matchSubcommand(subcommand)(interaction);
