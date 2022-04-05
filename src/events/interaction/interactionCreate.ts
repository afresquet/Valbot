import { MessageEmbed } from "discord.js";
import { Event } from "../../types/discord";

const eventReady: Event<"interactionCreate"> = client => {
	return async interaction => {
		try {
			if (!interaction.isCommand()) return;

			const command = client.commands.get(interaction.commandName);

			if (!command) {
				await interaction.reply({
					embeds: [
						new MessageEmbed()
							.setColor("RED")
							.setDescription("An error occurred while running this command."),
					],
				});

				client.commands.delete(interaction.commandName);

				return;
			}

			await command.execute(interaction, client);
		} catch (error) {
			console.error(error);
		}
	};
};

export default eventReady;
