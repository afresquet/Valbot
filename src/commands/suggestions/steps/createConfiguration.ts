import { InteractionPipeline } from "../../../lib/custom-pipelines/command/interaction-pipeline";
import {
	ISuggestionDocument,
	SuggestionModel,
} from "../../../schemas/Suggestion";

export const createSuggestionsConfiguration: InteractionPipeline.Step<
	unknown,
	Promise<ISuggestionDocument>
> = (_, interaction) => {
	const { options, guild } = interaction;

	const channelId = options.getChannel("channel");

	return SuggestionModel.create({
		guildId: guild!.id,
		channelId: channelId!.id,
	});
};
