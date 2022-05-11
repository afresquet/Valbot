import { InteractionPipeline } from "../../../lib/custom-pipelines/command/interaction-pipeline";
import { InteractionPipelineBuilder } from "../../../lib/custom-pipelines/command/InteractionPipeline";
import { ifelse } from "../../../lib/pipeline/steps/ifelse";
import { match } from "../../../lib/pipeline/steps/match";
import { ISuggestionDocument } from "../../../schemas/Suggestion";
import { matchSubcommandStep } from "../../../utils/matchSubcommand";
import { createSuggestionsConfiguration } from "./createConfiguration";
import { disableSuggestionsConfiguration } from "./disableConfiguration";
import { editSuggestionsConfiguration } from "./editConfiguration";

export const handleSetupSuggestionsSubcommands: InteractionPipeline.Step<
	ISuggestionDocument | undefined,
	string
> = match(m =>
	m
		.on(
			matchSubcommandStep("enable"),
			ifelse(
				configuration => configuration !== undefined,
				new InteractionPipelineBuilder<ISuggestionDocument | undefined>()
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
				new InteractionPipelineBuilder<ISuggestionDocument | undefined>()
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
				new InteractionPipelineBuilder<ISuggestionDocument | undefined>()
					.pipe(disableSuggestionsConfiguration)
					.pipe(() => "Suggestions have been disabled.")
					.step(),
				() => "Suggestions are not enabled on this server."
			)
		)
);
