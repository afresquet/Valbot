import { ifelse, match } from "../../../../lib/pipeline";
import { DiscordEventPipeline } from "../../../lib/discord-event-pipeline";
import DiscordEventPipelineBuilder from "../../../lib/discord-event-pipeline/DiscordEventPipeline";
import { matchSubcommandStep } from "../../../utils/matchSubcommand";
import { ISuggestionDocument } from "../schemas/Suggestion";
import { createSuggestionsConfiguration } from "./createConfiguration";
import { disableSuggestionsConfiguration } from "./disableConfiguration";
import { editSuggestionsConfiguration } from "./editConfiguration";

type Value = ISuggestionDocument | null;

export const handleSetupSuggestionsSubcommands: DiscordEventPipeline.CommandInteraction.Pipeline<
	Value,
	string
> = match(m =>
	m
		.on(
			matchSubcommandStep("enable"),
			ifelse(
				configuration => configuration === null,
				new DiscordEventPipelineBuilder.CommandInteraction<Value>()
					.pipe(createSuggestionsConfiguration)
					.pipe(() => "Suggestions are now enabled on this server.")
					.pipeline(),
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
					.pipeline(),
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
					.pipeline(),
				() => "Suggestions are not enabled on this server."
			)
		)
);
