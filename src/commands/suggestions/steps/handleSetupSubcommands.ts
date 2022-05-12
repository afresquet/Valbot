import { DiscordEventPipeline } from "../../../lib/custom-pipelines/discord-event/discord-event-pipeline";
import { DiscordEventPipelineBuilder } from "../../../lib/custom-pipelines/discord-event/DiscordEventPipeline";
import { ifelse } from "../../../lib/pipeline/steps/ifelse";
import { match } from "../../../lib/pipeline/steps/match";
import { ISuggestionDocument } from "../../../schemas/Suggestion";
import { matchSubcommandStep } from "../../../utils/matchSubcommand";
import { createSuggestionsConfiguration } from "./createConfiguration";
import { disableSuggestionsConfiguration } from "./disableConfiguration";
import { editSuggestionsConfiguration } from "./editConfiguration";

export const handleSetupSuggestionsSubcommands: DiscordEventPipeline.CommandInteraction.Step<
	ISuggestionDocument | undefined,
	string
> = match(m =>
	m
		.on(
			matchSubcommandStep("enable"),
			ifelse(
				configuration => configuration !== undefined,
				new DiscordEventPipelineBuilder.CommandInteraction<ISuggestionDocument>()
					.pipe(createSuggestionsConfiguration)
					.pipe(() => "Suggestions are now enabled on this server.")
					.step(),
				() => "Suggestions are already enabled on this server."
			)
		)
		.on(
			matchSubcommandStep("edit"),
			ifelse(
				configuration => configuration === undefined,
				new DiscordEventPipelineBuilder.CommandInteraction<undefined>()
					.pipe(editSuggestionsConfiguration)
					.pipe(() => "Suggestions channel has been updated.")
					.step(),
				() => "Suggestions are not enabled on this server."
			)
		)
		.on(
			matchSubcommandStep("disable"),
			ifelse(
				configuration => configuration === undefined,
				new DiscordEventPipelineBuilder.CommandInteraction<undefined>()
					.pipe(disableSuggestionsConfiguration)
					.pipe(() => "Suggestions have been disabled.")
					.step(),
				() => "Suggestions are not enabled on this server."
			)
		)
);
