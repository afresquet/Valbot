import { DiscordTypePipe } from "../../../lib";
import { ISuggestionDocument, SuggestionModel } from "../schemas/Suggestion";

export const getSuggestionsConfiguration: DiscordTypePipe.CommandInteraction.Function<
	unknown,
	Promise<
		DiscordTypePipe.CommandInteraction.Event & {
			configuration: ISuggestionDocument | null;
		}
	>
> = async (_, { interaction, ...context }) => ({
	...context,
	interaction,
	configuration: await SuggestionModel.findByGuild(interaction.guild!),
});
