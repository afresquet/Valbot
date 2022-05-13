import { MessageEmbed } from "discord.js";
import { DiscordEventPipeline } from "../../../lib/discord-event-pipeline";
import { Event } from "../../../types/discord";

const commandEvent: Event<"interactionCreate"> = {
	name: "command",
	event: "interactionCreate",
	execute: async ({ interaction }, event, context) => {
		if (!interaction.isCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			await interaction.reply({
				embeds: [
					new MessageEmbed()
						.setColor("RED")
						.setDescription("An error occurred while running this command."),
				],
			});

			interaction.client.commands.delete(interaction.commandName);

			return;
		}

		await command.execute(
			event as DiscordEventPipeline.CommandInteraction.Event,
			event as DiscordEventPipeline.CommandInteraction.Event,
			context
		);
	},
};

export default commandEvent;
