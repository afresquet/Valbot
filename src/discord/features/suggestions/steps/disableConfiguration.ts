import { DiscordEventPipeline } from "../../../lib/discord-event-pipeline";
import { SuggestionModel } from "../schemas/Suggestion";

export const disableSuggestionsConfiguration: DiscordEventPipeline.CommandInteraction.Fn<
	unknown,
	Promise<void>
> = async (_, { interaction }) => {
	await SuggestionModel.findOneAndDelete({ guildId: interaction.guild!.id });
};
