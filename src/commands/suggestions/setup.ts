import { SlashCommandBuilder } from "@discordjs/builders";
import { ChannelType } from "discord.js/node_modules/discord-api-types/v9";
import { SuggestionModel } from "../../schemas/Suggestion";
import { Command } from "../../types/discord";

const setupSuggestionsCommand: Command = {
	data: new SlashCommandBuilder()
		.setName("setup-suggestions")
		.setDescription("Setup suggestions for this server")
		.addSubcommand(subcommand =>
			subcommand
				.setName("enable")
				.setDescription("Enable suggestions")
				.addChannelOption(option =>
					option
						.setName("channel")
						.setDescription("The channel to post suggestions to")
						.setRequired(true)
						.addChannelType(ChannelType.GuildText)
				)
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName("edit")
				.setDescription("Edit suggestions' channel")
				.addChannelOption(option =>
					option
						.setName("channel")
						.setDescription("The new channel to post suggestions to")
						.setRequired(true)
						.addChannelType(ChannelType.GuildText)
				)
		)
		.addSubcommand(subcommand =>
			subcommand.setName("disable").setDescription("Disable suggestions")
		),
	execute: async interaction => {
		try {
			const { options, guildId } = interaction;

			const subcommand = options.getSubcommand();
			const channelId = options.getChannel("channel");

			const configuration = await SuggestionModel.findOne({ guildId });

			switch (subcommand) {
				case "enable":
					{
						if (configuration) {
							await interaction.reply({
								content: "Suggestions are already enabled on this server.",
								ephemeral: true,
							});

							return;
						}

						await SuggestionModel.create({
							guildId,
							channelId: channelId?.id,
						});

						await interaction.reply({
							content: "Suggestions are now enabled on this server.",
							ephemeral: true,
						});
					}
					break;

				case "edit":
					{
						if (!configuration) {
							await interaction.reply({
								content: "Suggestions are not enabled on this server.",
								ephemeral: true,
							});

							return;
						}

						await SuggestionModel.updateOne(
							{ guildId },
							{ channelId: channelId?.id }
						);

						await interaction.reply({
							content: "Suggestions channel has been updated.",
							ephemeral: true,
						});
					}
					break;

				case "disable":
					{
						if (!configuration) {
							await interaction.reply({
								content: "Suggestions are not enabled on this server.",
								ephemeral: true,
							});

							return;
						}

						await SuggestionModel.findOneAndDelete({ guildId });

						await interaction.reply({
							content: "Suggestions have been disabled.",
							ephemeral: true,
						});
					}
					break;
			}
		} catch (error) {
			console.error(error);
		}
	},
};

export default setupSuggestionsCommand;
