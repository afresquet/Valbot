import { CommandInteraction } from "discord.js";
import { DiscordEventPipeline } from "../lib/custom-pipelines/discord-event/discord-event-pipeline";

export const matchSubcommand =
	(subcommand: string) => (interaction: CommandInteraction) =>
		subcommand === interaction.options.getSubcommand();

export const matchSubcommandStep =
	(
		subcommand: string
	): DiscordEventPipeline.Step<"interactionCreate", unknown, boolean> =>
	(_, { interaction }) =>
		matchSubcommand(subcommand)(interaction as CommandInteraction);
