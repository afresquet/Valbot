import { DiscordTypePipe } from "../../../lib";
import { ISuggestionDocument } from "../schemas/Suggestion";

export const getSuggestionsConfiguration: DiscordTypePipe.CommandInteraction.Function<
	unknown,
	Promise<
		DiscordTypePipe.CommandInteraction.Event & {
			configuration: ISuggestionDocument | null;
		}
	>
> = async (
	_,
	{ interaction, ...context },
	{ models: { SuggestionModel } }
) => ({
	...context,
	interaction,
	configuration: await SuggestionModel.findByGuild(interaction.guild!),
});
