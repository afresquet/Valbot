import { CommandPipeline } from "../../../lib/custom-pipelines/command/command-pipeline";
import { SuggestionModel } from "../../../schemas/Suggestion";

export const editSuggestionsConfiguration: CommandPipeline.Step<
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
