import { DiscordEventPipeline } from "../../../lib/discord-event-pipeline";
import { ISuggestionDocument, SuggestionModel } from "../schemas/Suggestion";

export const getSuggestionsConfiguration: DiscordEventPipeline.CommandInteraction.Fn<
	unknown,
	Promise<ISuggestionDocument | null>
> = (_, { interaction }) => SuggestionModel.findByGuild(interaction.guild!);
