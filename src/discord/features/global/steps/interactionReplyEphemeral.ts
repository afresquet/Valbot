import { DiscordTypePipe } from "../../../lib";

export const interactionReplyEphemeral: DiscordTypePipe.CommandInteraction.Function<
	string
> = (content, { interaction }) => {
	return interaction.reply({
		content,
		ephemeral: true,
	});
};
