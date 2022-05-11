import { CommandPipeline } from "../../../lib/custom-pipelines/command/command-pipeline";
import { CommandPipelineBuilder } from "../../../lib/custom-pipelines/command/CommandPipeline";
import { ifelse } from "../../../lib/pipeline/steps/ifelse";
import { match } from "../../../lib/pipeline/steps/match";
import { ILiveRoleDocument } from "../../../schemas/LiveRole";
import { matchSubcommandStep } from "../../../utils/matchSubcommand";
import { createLiveRoleConfiguration } from "./createConfiguration";
import { disableLiveRoleConfiguration } from "./disableConfiguration";
import { editLiveRoleConfiguration } from "./editConfiguration";

export const handleLiveRoleSubcommands: CommandPipeline.Step<
	ILiveRoleDocument | undefined,
	string
> = match(m =>
	m
		.on(
			matchSubcommandStep("enable"),
			ifelse(
				configuration => configuration !== undefined,
				new CommandPipelineBuilder<ILiveRoleDocument | undefined>()
					.pipe(createLiveRoleConfiguration)
					.pipe(() => "Live role is now enabled on this server.")
					.step(),
				() => "Live role is already enabled on this server."
			)
		)
		.on(
			matchSubcommandStep("edit"),
			ifelse(
				configuration => configuration === undefined,
				new CommandPipelineBuilder<ILiveRoleDocument | undefined>()
					.pipe(editLiveRoleConfiguration)
					.pipe(() => "Live role was edited.")
					.step(),
				() => "Live role is not enabled on this server."
			)
		)
		.on(
			matchSubcommandStep("disable"),
			ifelse(
				configuration => configuration === undefined,
				new CommandPipelineBuilder<ILiveRoleDocument | undefined>()
					.pipe(disableLiveRoleConfiguration)
					.pipe(() => "Live role was disabled.")
					.step(),
				() => "Live role is not enabled on this server."
			)
		)
);
