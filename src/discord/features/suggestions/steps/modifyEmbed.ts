import { MessageEmbed } from "discord.js";
import { DiscordTypePipe } from "../../../lib";

export const modifyEmbed: DiscordTypePipe.ButtonInteraction.MatchFunction<
	MessageEmbed,
	MessageEmbed
> = match =>
	match
		.on(
			(_, { interaction }) => interaction.customId === "suggestion-accept",
			embed =>
				new MessageEmbed(embed).setColor("GREEN").spliceFields(2, 1, {
					name: "Status",
					value: "Accepted",
					inline: true,
				})
		)
		.on(
			(_, { interaction }) => interaction.customId === "suggestion-decline",
			embed =>
				new MessageEmbed(embed).setColor("RED").spliceFields(2, 1, {
					name: "Status",
					value: "Declined",
					inline: true,
				})
		)
		.otherwise((_, __, { Errors }) => {
			throw new Errors.Exit();
		});
