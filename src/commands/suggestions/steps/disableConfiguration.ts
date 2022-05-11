import { InteractionPipeline } from "../../../lib/custom-pipelines/command/interaction-pipeline";
import { SuggestionModel } from "../../../schemas/Suggestion";

export const disableSuggestionsConfiguration: InteractionPipeline.Step<
	unknown,
	Promise<void>
> = async (_, interaction) => {
	await SuggestionModel.findOneAndDelete({ guildId: interaction.guild!.id });
};
