import DiscordPipeline, { DiscordTypePipe } from "../../../lib";
import { DiscordErrors } from "../../../utils/DiscordErrors";
import { matchSubcommand } from "../../../utils/matchSubcommand";
import { ILiveRoleDocument } from "../schemas/LiveRole";
import { createLiveRoleConfiguration } from "./createConfiguration";
import { disableLiveRoleConfiguration } from "./disableConfiguration";
import { editLiveRoleConfiguration } from "./editConfiguration";

type Value = ILiveRoleDocument | null;

export const handleLiveRoleSubcommands: DiscordTypePipe.CommandInteraction.MatchFunction<
	Value,
	Promise<string>
> = match =>
	match
		.on(
			(configuration, { interaction }) =>
				matchSubcommand("enable", interaction) && configuration === null,
			new DiscordPipeline.CommandInteraction<Value>()
				.pipe(createLiveRoleConfiguration)
				.pipe(() => "Live role is now enabled on this server.")
				.compose()
		)
		.on(
			(configuration, { interaction }) =>
				matchSubcommand("enable", interaction) && configuration !== null,
			() => "Live role is already enabled on this server."
		)
		.on(
			(configuration, { interaction }) =>
				matchSubcommand("edit", interaction) && configuration !== null,
			new DiscordPipeline.CommandInteraction<Value>()
				.pipe(editLiveRoleConfiguration)
				.pipe(() => "Live role was edited.")
				.compose()
		)
		.on(
			(configuration, { interaction }) =>
				matchSubcommand("edit", interaction) && configuration === null,
			() => "Live role is not enabled on this server."
		)
		.on(
			(configuration, { interaction }) =>
				matchSubcommand("disable", interaction) && configuration !== null,
			new DiscordPipeline.CommandInteraction<Value>()
				.pipe(disableLiveRoleConfiguration)
				.pipe(() => "Live role was disabled.")
				.compose()
		)
		.on(
			(configuration, { interaction }) =>
				matchSubcommand("disable", interaction) && configuration === null,
			() => "Live role is not enabled on this server."
		)
		.otherwise(() => {
			throw new DiscordErrors.Exit();
		});
