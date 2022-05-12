import { DiscordEventPipeline } from "../../../lib/discord-event-pipeline";

export const interactionReplyEphemeral: DiscordEventPipeline.CommandInteraction.Step<
	string,
	void
> = (content, { interaction }) => {
	return interaction.reply({
		content,
		ephemeral: true,
	});
};
