import { DiscordEventPipeline } from "../../../lib/discord-event-pipeline";
import { ISuggestionDocument, SuggestionModel } from "../schemas/Suggestion";

export const createSuggestionsConfiguration: DiscordEventPipeline.CommandInteraction.Pipeline<
	unknown,
	ISuggestionDocument
> = (_, { interaction }) => {
	const { options, guild } = interaction;

	const channelId = options.getChannel("channel");

	return SuggestionModel.create({
		guildId: guild!.id,
		channelId: channelId!.id,
	});
};
