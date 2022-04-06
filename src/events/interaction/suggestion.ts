import { MessageEmbed } from "discord.js";
import { Event } from "../../types/discord";

const suggestionEvent: Event<"interactionCreate"> = {
	name: "suggestion",
	event: "interactionCreate",
	execute: async interaction => {
		try {
			if (!interaction.isButton()) return;

			const { customId, message } = interaction;

			const embed = message.embeds[0];

			if (!embed) return;

			delete embed.fields?.[2];

			let newEmbed = embed;

			switch (customId) {
				case "suggestion-accept":
					{
						newEmbed = new MessageEmbed(embed)
							.setColor("GREEN")
							.addField("Status", "Accepted", true);
					}
					break;
				case "suggestion-decline":
					{
						newEmbed = new MessageEmbed(embed)
							.setColor("RED")
							.addField("Status", "Declined", true);
					}
					break;
			}

			await interaction.update({ embeds: [newEmbed], components: [] });
		} catch (error) {
			console.error(error);
		}
	},
};

export default suggestionEvent;
