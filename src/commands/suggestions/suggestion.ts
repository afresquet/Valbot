import { SlashCommandBuilder } from "@discordjs/builders";
import { DiscordEventPipelineBuilder } from "../../lib/custom-pipelines/discord-event/DiscordEventPipeline";
import { createAcceptDeclineButtons } from "../../lib/custom-pipelines/steps/createAcceptDeclineButtons";
import { assert } from "../../lib/pipeline/steps/assert";
import { pairwise } from "../../lib/pipeline/steps/pairwise";
import { tap } from "../../lib/pipeline/steps/tap";
import { Command } from "../../types/discord";
import { createSuggestionEmbed } from "./steps/createEmbed";
import { getSuggestionsConfiguration } from "./steps/getConfiguration";

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
			assert(() => new Error("Suggestions are not enabled on this server."))
		)
		.pipe(
			tap((configuration, { interaction }) => {
				if (configuration.channelId !== interaction.channel!.id) {
					throw new Error(
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
		.build(),
};

export default suggestCommand;
