import { DiscordEventPipeline } from "../../../lib/custom-pipelines/discord-event/discord-event-pipeline";
import { SuggestionModel } from "../../../schemas/Suggestion";

export const disableSuggestionsConfiguration: DiscordEventPipeline.Step<
	"interactionCreate",
	unknown,
	Promise<void>
> = async (_, { interaction }) => {
	await SuggestionModel.findOneAndDelete({ guildId: interaction.guild!.id });
};
