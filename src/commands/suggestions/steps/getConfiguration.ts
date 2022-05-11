import { InteractionPipeline } from "../../../lib/custom-pipelines/command/interaction-pipeline";
import {
	ISuggestionDocument,
	SuggestionModel,
} from "../../../schemas/Suggestion";

export const getSuggestionsConfiguration: InteractionPipeline.Step<
	unknown,
	ISuggestionDocument | undefined
> = (_, interaction) => SuggestionModel.findByGuild(interaction.guild!);
