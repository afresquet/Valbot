import { GuildBasedChannel } from "discord.js";
import { DiscordTypePipe } from "../../../lib";
import { ISuggestionDocument } from "../schemas/Suggestion";
import { createSuggestionsConfiguration } from "./createConfiguration";
import { disableSuggestionsConfiguration } from "./disableConfiguration";
import { editSuggestionsConfiguration } from "./editConfiguration";

export const handleSetupSuggestionsSubcommands: DiscordTypePipe.CommandInteraction.MatchFunction<
	GuildBasedChannel | null,
	Promise<string>,
	{ configuration: ISuggestionDocument | null }
> = match =>
	match
		.on(
			(channel, { configuration }) =>
				channel !== null && configuration === null,
			createSuggestionsConfiguration
		)
		.on(
			(channel, { configuration }) =>
				channel !== null && configuration !== null,
			editSuggestionsConfiguration
		)
		.on(
			(channel, { configuration }) =>
				channel === null && configuration !== null,
			disableSuggestionsConfiguration
		)
		.otherwise(() => "Suggestions are not enabled on this server.");
