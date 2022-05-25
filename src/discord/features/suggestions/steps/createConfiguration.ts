import { DiscordTypePipe } from "../../../lib";
import { ISuggestionDocument, SuggestionModel } from "../schemas/Suggestion";

export const createSuggestionsConfiguration: DiscordTypePipe.CommandInteraction.Function<
	unknown,
	Promise<ISuggestionDocument>
> = (_, { interaction }) => {
	const { options, guild } = interaction;

	const channelId = options.getChannel("channel");

	return SuggestionModel.create({
		guildId: guild!.id,
		channelId: channelId!.id,
	});
};
