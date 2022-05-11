import { CommandPipeline } from "../../../lib/custom-pipelines/command/command-pipeline";
import { SuggestionModel } from "../../../schemas/Suggestion";

export const disableSuggestionsConfiguration: CommandPipeline.Step<
	unknown,
	Promise<void>
> = async (_, interaction) => {
	await SuggestionModel.findOneAndDelete({ guildId: interaction.guild!.id });
};
