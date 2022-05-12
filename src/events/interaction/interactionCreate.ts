import { MessageEmbed } from "discord.js";
import { Event } from "../../types/discord";

const interactionCreateEvent: Event<"interactionCreate"> = {
	name: "interactionCreate",
	event: "interactionCreate",
	execute: async ({ interaction }) => {
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

		await command.execute({ interaction });
	},
};

export default interactionCreateEvent;
