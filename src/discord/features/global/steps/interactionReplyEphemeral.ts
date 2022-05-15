import { DiscordEventPipeline } from "../../../lib/discord-event-pipeline";

export const interactionReplyEphemeral: DiscordEventPipeline.CommandInteraction.Function<
	string
> = (content, { interaction }) => {
	return interaction.reply({
		content,
		ephemeral: true,
	});
};
