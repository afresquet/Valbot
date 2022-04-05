import { SlashCommandBuilder } from "@discordjs/builders";
import { Command } from "../../types/discord";

const pingCommand: Command = {
	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Tests connection to the bot."),
	execute(interaction, client) {
		interaction.reply({
			content: `Pong! Ping is \`${client.ws.ping}ms\``,
			ephemeral: true,
		});
	},
};

export default pingCommand;
