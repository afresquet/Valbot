import { GuildBasedChannel } from "discord.js";
import { DiscordTypePipe } from "../../../lib";

export const createSuggestionsConfiguration: DiscordTypePipe.CommandInteraction.Function<
	GuildBasedChannel | null,
	Promise<string>
> = async (
	channel,
	{ interaction },
	{ models: { SuggestionModel }, Errors }
) => {
	if (channel === null) {
		throw new Errors.Exit();
	}

	await SuggestionModel.create({
		guildId: interaction.guild!.id,
		channelId: channel.id,
	});

	return "Suggestions are now enabled on this server.";
};
