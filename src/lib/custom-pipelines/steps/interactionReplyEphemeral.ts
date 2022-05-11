import { InteractionPipeline } from "../command/interaction-pipeline";

export const interactionReplyEphemeral: InteractionPipeline.Step<
	string,
	Promise<void>
> = (content, interaction) => {
	return interaction.reply({
		content,
		ephemeral: true,
	});
};
