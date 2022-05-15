import { ifelse } from "typepipe/dist/steps";
import { DiscordEventPipeline } from "../../../lib/discord-event-pipeline";
import DiscordEventPipelineBuilder from "../../../lib/discord-event-pipeline/DiscordEventPipeline";
import { DiscordErrors } from "../../../utils/DiscordErrors";
import { matchSubcommandStep } from "../../../utils/matchSubcommand";
import { ILiveRoleDocument } from "../schemas/LiveRole";
import { createLiveRoleConfiguration } from "./createConfiguration";
import { disableLiveRoleConfiguration } from "./disableConfiguration";
import { editLiveRoleConfiguration } from "./editConfiguration";

type Value = ILiveRoleDocument | null;

export const handleLiveRoleSubcommands: DiscordEventPipeline.CommandInteraction.MatchFunction<
	Value,
	Promise<string>
> = match =>
	match
		.on(
			matchSubcommandStep("enable"),
			ifelse(
				configuration => configuration === null,
				new DiscordEventPipelineBuilder.CommandInteraction<Value>()
					.pipe(createLiveRoleConfiguration)
					.pipe(() => "Live role is now enabled on this server.")
					.compose(),
				() => "Live role is already enabled on this server."
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
				() => "Live role is not enabled on this server."
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
				() => "Live role is not enabled on this server."
			)
		)
		.otherwise(() => {
			throw new DiscordErrors.Exit();
		});
