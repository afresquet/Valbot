import { SlashCommandBuilder } from "@discordjs/builders";
import { assert, pairwise, tap } from "../../../../lib/pipeline";
import DiscordEventPipelineBuilder from "../../../lib/discord-event-pipeline/DiscordEventPipeline";
import { Command } from "../../../types/discord";
import { DiscordErrors } from "../../../utils/DiscordErrors";
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
				.addChoice("Command", "Command")
				.addChoice("Channel", "Channel")
				.addChoice("Event", "Event")
				.addChoice("Other", "Other")
		)
		.addStringOption(option =>
			option
				.setName("suggestion")
				.setDescription("Describe your suggestion")
				.setRequired(true)
		),
	execute: new DiscordEventPipelineBuilder.CommandInteraction()
		.pipe(getSuggestionsConfiguration)
		.pipe(
			assert(
				() =>
					new DiscordErrors.CommandInteractionReplyEphemeral(
						"Suggestions are not enabled on this server."
					)
			)
		)
		.pipe(
			tap((configuration, { interaction }) => {
				if (configuration.channelId !== interaction.channel!.id) {
					throw new DiscordErrors.CommandInteractionReplyEphemeral(
						`You can't use this command here, go to <#${configuration.channelId}> instead.`
					);
				}
			})
		)
		.pipe(createSuggestionEmbed)
		.pipe(pairwise(createAcceptDeclineButtons("suggestion")))
		.pipe(async ([embed, buttons], { interaction }) => {
			await interaction.reply({
				embeds: [embed],
				components: [buttons],
				fetchReply: true,
			});
		})
		.pipeline(),
};

export default suggestCommand;
