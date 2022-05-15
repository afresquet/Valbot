import { ifelse } from "typepipe/dist/steps";
import { DiscordEventPipeline } from "../../../lib/discord-event-pipeline";
import DiscordEventPipelineBuilder from "../../../lib/discord-event-pipeline/DiscordEventPipeline";
import { DiscordErrors } from "../../../utils/DiscordErrors";
import { matchSubcommandStep } from "../../../utils/matchSubcommand";
import { ISuggestionDocument } from "../schemas/Suggestion";
import { createSuggestionsConfiguration } from "./createConfiguration";
import { disableSuggestionsConfiguration } from "./disableConfiguration";
import { editSuggestionsConfiguration } from "./editConfiguration";

type Value = ISuggestionDocument | null;

export const handleSetupSuggestionsSubcommands: DiscordEventPipeline.CommandInteraction.MatchFunction<
	Value,
	Promise<string>
> = match =>
	match
		.on(
			matchSubcommandStep("enable"),
			ifelse(
				configuration => configuration === null,
				new DiscordEventPipelineBuilder.CommandInteraction<Value>()
					.pipe(createSuggestionsConfiguration)
					.pipe(() => "Suggestions are now enabled on this server.")
					.compose(),
				() => "Suggestions are already enabled on this server."
			)
		)
		.on(
			matchSubcommandStep("edit"),
			ifelse(
				configuration => configuration !== null,
				new DiscordEventPipelineBuilder.CommandInteraction<Value>()
					.pipe(editSuggestionsConfiguration)
					.pipe(() => "Suggestions channel has been updated.")
					.compose(),
				() => "Suggestions are not enabled on this server."
			)
		)
		.on(
			matchSubcommandStep("disable"),
			ifelse(
				configuration => configuration !== null,
				new DiscordEventPipelineBuilder.CommandInteraction<Value>()
					.pipe(disableSuggestionsConfiguration)
					.pipe(() => "Suggestions have been disabled.")
					.compose(),
				() => "Suggestions are not enabled on this server."
			)
		)
		.otherwise(() => {
			throw new DiscordErrors.Exit();
		});
