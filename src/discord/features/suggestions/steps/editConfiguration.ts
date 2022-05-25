import { DiscordTypePipe } from "../../../lib";
import { SuggestionModel } from "../schemas/Suggestion";

export const editSuggestionsConfiguration: DiscordTypePipe.CommandInteraction.Function<
	unknown,
	Promise<void>
> = async (_, { interaction }) => {
	const { options, guild } = interaction;

	const channelId = options.getChannel("channel");

	await SuggestionModel.updateOne(
		{ guildId: guild!.id },
		{ channelId: channelId!.id }
	);
};
