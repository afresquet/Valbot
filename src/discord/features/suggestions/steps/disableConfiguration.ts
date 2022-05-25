import { DiscordTypePipe } from "../../../lib";
import { SuggestionModel } from "../schemas/Suggestion";

export const disableSuggestionsConfiguration: DiscordTypePipe.CommandInteraction.Function<
	unknown,
	Promise<void>
> = async (_, { interaction }) => {
	await SuggestionModel.findOneAndDelete({ guildId: interaction.guild!.id });
};
