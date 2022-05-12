import { CommandInteraction } from "discord.js";
import { DiscordEventPipeline } from "../../../lib/custom-pipelines/discord-event/discord-event-pipeline";
import {
	ISuggestionDocument,
	SuggestionModel,
} from "../../../schemas/Suggestion";

export const createSuggestionsConfiguration: DiscordEventPipeline.Step<
	"interactionCreate",
	unknown,
	Promise<ISuggestionDocument>
> = (_, { interaction }) => {
	const { options, guild } = interaction as CommandInteraction;

	const channelId = options.getChannel("channel");

	return SuggestionModel.create({
		guildId: guild!.id,
		channelId: channelId!.id,
	});
};
