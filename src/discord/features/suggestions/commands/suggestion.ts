import { SlashCommandBuilder } from "@discordjs/builders";
import DiscordPipeline from "../../../lib";
import { Command } from "../../../types/discord";
import { createAcceptDeclineButtons } from "../../global/steps/createAcceptDeclineButtons";
import { createSuggestionEmbed } from "../steps/createEmbed";
import { getSuggestionsConfiguration } from "../steps/getConfiguration";

const suggestCommand: Command = {
	data: new SlashCommandBuilder()
		.setName("suggestion")
		.setDescription("Suggest something to be added/changed in the server")
		.addStringOption(option =>
			option
				.setName("type")
				.setDescription("Select an option")
				.setRequired(true)
				.addChoices(
					{ name: "Command", value: "Command" },
					{ name: "Channel", value: "Channel" },
					{ name: "Event", value: "Event" },
					{ name: "Other", value: "Other" }
				)
		)
		.addStringOption(option =>
			option
				.setName("suggestion")
				.setDescription("Describe your suggestion")
				.setRequired(true)
		),
	execute: new DiscordPipeline.CommandInteraction()
		.context(getSuggestionsConfiguration)
		.tap((_, { interaction, configuration }, { Errors }) => {
			if (configuration === null) {
				throw new Errors.InteractionReplyEphemeral({
					content: "Suggestions are not enabled on this server.",
				});
			}

			if (configuration.channelId !== interaction.channel!.id) {
				throw new Errors.InteractionReplyEphemeral({
					content: `You can't use this command here, go to <#${configuration.channelId}> instead.`,
				});
			}
		})
		.pipe(createSuggestionEmbed)
		.pairwise(createAcceptDeclineButtons("suggestion"))
		.pipe(async ([embed, buttons], { interaction }) => {
			await interaction.reply({
				embeds: [embed],
				components: [buttons],
				fetchReply: true,
			});
		})
		.compose(),
};

export default suggestCommand;
