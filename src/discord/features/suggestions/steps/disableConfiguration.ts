import { DiscordEventPipeline } from "../../../lib/discord-event-pipeline";
import { SuggestionModel } from "../schemas/Suggestion";

export const disableSuggestionsConfiguration: DiscordEventPipeline.CommandInteraction.Pipeline<
	unknown,
	void
> = async (_, { interaction }) => {
	await SuggestionModel.findOneAndDelete({ guildId: interaction.guild!.id });
};
