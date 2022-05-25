import { MessageEmbed } from "discord.js";
import { DiscordTypePipe } from "../../../lib";
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
			event as DiscordTypePipe.CommandInteraction.Event,
			event as DiscordTypePipe.CommandInteraction.Event,
			context
		);
	},
};

export default commandEvent;
