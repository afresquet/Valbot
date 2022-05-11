import { CommandPipeline } from "../../../lib/custom-pipelines/command/command-pipeline";
import {
	ISuggestionDocument,
	SuggestionModel,
} from "../../../schemas/Suggestion";

export const getSuggestionsConfiguration: CommandPipeline.Step<
	unknown,
	ISuggestionDocument | undefined
> = (_, interaction) => SuggestionModel.findByGuild(interaction.guild!);
