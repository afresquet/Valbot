import { InteractionPipeline } from "../../../lib/custom-pipelines/command/interaction-pipeline";
import { SuggestionModel } from "../../../schemas/Suggestion";

export const editSuggestionsConfiguration: InteractionPipeline.Step<
	unknown,
	Promise<void>
> = async (_, interaction) => {
	const { options, guild } = interaction;

	const channelId = options.getChannel("channel");

	await SuggestionModel.updateOne(
		{ guildId: guild!.id },
		{ channelId: channelId!.id }
	);
};
