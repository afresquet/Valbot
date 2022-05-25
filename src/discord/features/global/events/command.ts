import { MessageEmbed } from "discord.js";
import { Event } from "../../../types/discord";

const commandEvent: Event<"interactionCreate"> = {
	name: "command",
	event: "interactionCreate",
	execute: async (_, { interaction }, context) => {
		if (!interaction.isCommand()) return;

		let name = interaction.commandName;

		if (name === "setup") {
			const subcommand = interaction.options.getSubcommand(true);

			name = `setup-${subcommand}`;
		}

		const command = interaction.client.commands.get(name);

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

		await command.execute({ interaction }, { interaction }, context);
	},
};

export default commandEvent;
