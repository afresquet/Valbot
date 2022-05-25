import { GuildBasedChannel } from "discord.js";
import { Errors } from "../../../../utils/Errors";
import { DiscordTypePipe } from "../../../lib";
import { SuggestionModel } from "../schemas/Suggestion";

export const createSuggestionsConfiguration: DiscordTypePipe.CommandInteraction.Function<
	GuildBasedChannel | null,
	Promise<string>
> = async (channel, { interaction }) => {
	if (channel === null) {
		throw new Errors.Exit();
	}

	await SuggestionModel.create({
		guildId: interaction.guild!.id,
		channelId: channel.id,
	});

	return "Suggestions are now enabled on this server.";
};
