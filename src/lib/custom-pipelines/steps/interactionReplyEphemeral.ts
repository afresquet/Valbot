import { CommandPipeline } from "../command/command-pipeline";

export const interactionReplyEphemeral: CommandPipeline.Step<
	string,
	Promise<void>
> = (content, interaction) => {
	return interaction.reply({
		content,
		ephemeral: true,
	});
};
