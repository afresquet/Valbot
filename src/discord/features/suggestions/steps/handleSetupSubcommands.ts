import DiscordPipeline, { DiscordTypePipe } from "../../../lib";
import { DiscordErrors } from "../../../utils/DiscordErrors";
import { matchSubcommand } from "../../../utils/matchSubcommand";
import { ISuggestionDocument } from "../schemas/Suggestion";
import { createSuggestionsConfiguration } from "./createConfiguration";
import { disableSuggestionsConfiguration } from "./disableConfiguration";
import { editSuggestionsConfiguration } from "./editConfiguration";

type Value = ISuggestionDocument | null;

export const handleSetupSuggestionsSubcommands: DiscordTypePipe.CommandInteraction.MatchFunction<
	Value,
	Promise<string>
> = match =>
	match
		.on(
			(configuration, { interaction }) =>
				matchSubcommand("enable", interaction) && configuration === null,
			new DiscordPipeline.CommandInteraction<Value>()
				.pipe(createSuggestionsConfiguration)
				.pipe(() => "Suggestions are now enabled on this server.")
				.compose()
		)
		.on(
			(configuration, { interaction }) =>
				matchSubcommand("enable", interaction) && configuration !== null,
			() => "Suggestions are already enabled on this server."
		)
		.on(
			(configuration, { interaction }) =>
				matchSubcommand("edit", interaction) && configuration !== null,
			new DiscordPipeline.CommandInteraction<Value>()
				.pipe(editSuggestionsConfiguration)
				.pipe(() => "Suggestions channel has been updated.")
				.compose()
		)
		.on(
			(configuration, { interaction }) =>
				matchSubcommand("edit", interaction) && configuration !== null,
			() => "Suggestions are not enabled on this server."
		)
		.on(
			(configuration, { interaction }) =>
				matchSubcommand("disable", interaction) && configuration !== null,
			new DiscordPipeline.CommandInteraction<Value>()
				.pipe(disableSuggestionsConfiguration)
				.pipe(() => "Suggestions have been disabled.")
				.compose()
		)
		.on(
			(configuration, { interaction }) =>
				matchSubcommand("disable", interaction) && configuration === null,
			() => "Suggestions are not enabled on this server."
		)
		.otherwise(() => {
			throw new DiscordErrors.Exit();
		});
