import { DiscordTypePipe } from "../../../lib";
import { ISuggestionDocument, SuggestionModel } from "../schemas/Suggestion";

export const getSuggestionsConfiguration: DiscordTypePipe.CommandInteraction.Function<
	unknown,
	Promise<ISuggestionDocument | null>
> = (_, { interaction }) => SuggestionModel.findByGuild(interaction.guild!);
