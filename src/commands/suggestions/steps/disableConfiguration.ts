import { DiscordEventPipeline } from "../../../lib/custom-pipelines/discord-event/discord-event-pipeline";
import { SuggestionModel } from "../../../schemas/Suggestion";

export const disableSuggestionsConfiguration: DiscordEventPipeline.CommandInteraction.Step<
	unknown,
	void
> = async (_, { interaction }) => {
	await SuggestionModel.findOneAndDelete({ guildId: interaction.guild!.id });
};
