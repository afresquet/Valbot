import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { SuggestionModel } from "../../schemas/Suggestion";
import { Command } from "../../types/discord";

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
	execute: async interaction => {
		try {
			const { options, user, guild, channelId } = interaction;

			const configuration = await SuggestionModel.findByGuild(guild!);

			if (!configuration) {
				interaction.reply({
					content: "Suggestions are not enabled on this server.",
					ephemeral: true,
				});

				return;
			}

			if (configuration.channelId !== channelId) {
				interaction.reply({
					content: `You can't use this command here, go to <#${configuration.channelId}> instead.`,
					ephemeral: true,
				});

				return;
			}

			const type = options.getString("type");
			const suggestion = options.getString("suggestion");

			const embed = new MessageEmbed({})
				.setColor("BLUE")
				.setAuthor({
					name: user.username,
					iconURL: user.displayAvatarURL({ dynamic: true }),
				})
				.addFields(
					{ name: "Suggestion", value: suggestion! },
					{ name: "Type", value: type!, inline: true },
					{ name: "Status", value: "Pending", inline: true }
				)
				.setTimestamp();

			const buttons = new MessageActionRow();

			buttons.addComponents(
				new MessageButton()
					.setCustomId("suggestion-accept")
					.setLabel("✅ Accept")
					.setStyle("PRIMARY"),
				new MessageButton()
					.setCustomId("suggestion-decline")
					.setLabel("⛔ Decline")
					.setStyle("PRIMARY")
			);

			await interaction.reply({
				embeds: [embed],
				components: [buttons],
				fetchReply: true,
			});
		} catch (error) {
			console.error(error);
		}
	},
};

export default suggestCommand;
