import { DiscordEventPipeline } from "../../../lib/discord-event-pipeline";

export const interactionReplyEphemeral: DiscordEventPipeline.CommandInteraction.Pipeline<
	string
> = (content, { interaction }) => {
	return interaction.reply({
		content,
		ephemeral: true,
	});
};
