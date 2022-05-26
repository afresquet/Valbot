import { GuildBasedChannel } from "discord.js";
import { DiscordTypePipe } from "../../../lib";
import { SuggestionModel } from "../schemas/Suggestion";

export const editSuggestionsConfiguration: DiscordTypePipe.CommandInteraction.Function<
	GuildBasedChannel | null,
	Promise<string>
> = async (channel, { interaction }, { Errors }) => {
	if (!channel) {
		throw new Errors.Exit();
	}

	await SuggestionModel.updateOne(
		{ guildId: interaction.guild!.id },
		{ channelId: channel.id }
	);

	return "Suggestions channel has been updated.";
};
