import { MessageEmbed } from "discord.js";
import DiscordPipeline from "../../../lib";
import { Event } from "../../../types/discord";
import { customId } from "../../global/steps/customId";
import { interactionType } from "../../global/steps/interactionType";
import { modifyEmbed } from "../steps/modifyEmbed";

const suggestionEvent: Event<"interactionCreate"> = {
	name: "suggestion",
	event: "interactionCreate",
	execute: new DiscordPipeline<"interactionCreate">()
		.context(interactionType.BUTTON)
		.tap(customId("suggestion-accept", "suggestion-decline"))
		.pipe((_, { interaction }) => interaction.message.embeds[0] as MessageEmbed)
		.match(modifyEmbed)
		.tap(async (embed, { interaction }) => {
			await interaction.update({ embeds: [embed], components: [] });
		})
		.compose(),
};

export default suggestionEvent;
