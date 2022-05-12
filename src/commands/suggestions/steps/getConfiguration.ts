import { DiscordEventPipeline } from "../../../lib/custom-pipelines/discord-event/discord-event-pipeline";
import {
	ISuggestionDocument,
	SuggestionModel,
} from "../../../schemas/Suggestion";

export const getSuggestionsConfiguration: DiscordEventPipeline.CommandInteraction.Step<
	unknown,
	ISuggestionDocument | undefined
> = (_, { interaction }) => SuggestionModel.findByGuild(interaction.guild!);
