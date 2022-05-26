import { DiscordTypePipe } from "../../../lib";

export const disableSuggestionsConfiguration: DiscordTypePipe.CommandInteraction.Function<
	unknown,
	Promise<string>
> = async (_, { interaction }, { models: { SuggestionModel } }) => {
	await SuggestionModel.findOneAndDelete({ guildId: interaction.guild!.id });

	return "Suggestions have been disabled.";
};
