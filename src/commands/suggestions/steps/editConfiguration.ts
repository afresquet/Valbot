import { CommandInteraction } from "discord.js";
import { DiscordEventPipeline } from "../../../lib/custom-pipelines/discord-event/discord-event-pipeline";
import { SuggestionModel } from "../../../schemas/Suggestion";

export const editSuggestionsConfiguration: DiscordEventPipeline.Step<
	"interactionCreate",
	unknown,
	Promise<void>
> = async (_, { interaction }) => {
	const { options, guild } = interaction as CommandInteraction;

	const channelId = options.getChannel("channel");

	await SuggestionModel.updateOne(
		{ guildId: guild!.id },
		{ channelId: channelId!.id }
	);
};
