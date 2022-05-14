import { ifelse, match } from "../../../../lib/pipeline";
import { DiscordEventPipeline } from "../../../lib/discord-event-pipeline";
import DiscordEventPipelineBuilder from "../../../lib/discord-event-pipeline/DiscordEventPipeline";
import { matchSubcommandStep } from "../../../utils/matchSubcommand";
import { ILiveRoleDocument } from "../schemas/LiveRole";
import { createLiveRoleConfiguration } from "./createConfiguration";
import { disableLiveRoleConfiguration } from "./disableConfiguration";
import { editLiveRoleConfiguration } from "./editConfiguration";

type Value = ILiveRoleDocument | null;

export const handleLiveRoleSubcommands: DiscordEventPipeline.CommandInteraction.Pipeline<
	Value,
	Promise<string>
> = match(m =>
	m
		.on(
			matchSubcommandStep("enable"),
			ifelse(
				configuration => configuration === null,
				new DiscordEventPipelineBuilder.CommandInteraction<Value>()
					.pipe(createLiveRoleConfiguration)
					.pipe(() => "Live role is now enabled on this server.")
					.compose(),
				async () => "Live role is already enabled on this server."
			)
		)
		.on(
			matchSubcommandStep("edit"),
			ifelse(
				configuration => configuration !== null,
				new DiscordEventPipelineBuilder.CommandInteraction<Value>()
					.pipe(editLiveRoleConfiguration)
					.pipe(() => "Live role was edited.")
					.compose(),
				async () => "Live role is not enabled on this server."
			)
		)
		.on(
			matchSubcommandStep("disable"),
			ifelse(
				configuration => configuration !== null,
				new DiscordEventPipelineBuilder.CommandInteraction<Value>()
					.pipe(disableLiveRoleConfiguration)
					.pipe(() => "Live role was disabled.")
					.compose(),
				async () => "Live role is not enabled on this server."
			)
		)
);
