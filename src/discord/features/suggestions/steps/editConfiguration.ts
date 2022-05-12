import { DiscordEventPipeline } from "../../../lib/discord-event-pipeline";
import { SuggestionModel } from "../schemas/Suggestion";

export const editSuggestionsConfiguration: DiscordEventPipeline.CommandInteraction.Step<
	unknown,
	void
> = async (_, { interaction }) => {
	const { options, guild } = interaction;

	const channelId = options.getChannel("channel");

	await SuggestionModel.updateOne(
		{ guildId: guild!.id },
		{ channelId: channelId!.id }
	);
};
