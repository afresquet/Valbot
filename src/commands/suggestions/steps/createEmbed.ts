import { MessageEmbed } from "discord.js";
import { InteractionPipeline } from "../../../lib/custom-pipelines/command/interaction-pipeline";

export const createSuggestionEmbed: InteractionPipeline.Step<
	unknown,
	MessageEmbed
> = (_, interaction) => {
	const { options, user } = interaction;

	const type = options.getString("type", true);
	const suggestion = options.getString("suggestion", true);

	return new MessageEmbed({})
		.setColor("BLUE")
		.setAuthor({
			name: user.username,
			iconURL: user.displayAvatarURL({ dynamic: true }),
		})
		.addFields(
			{ name: "Suggestion", value: suggestion },
			{ name: "Type", value: type, inline: true },
			{ name: "Status", value: "Pending", inline: true }
		)
		.setTimestamp();
};
