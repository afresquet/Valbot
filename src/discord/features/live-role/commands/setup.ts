import { SlashCommandBuilder } from "@discordjs/builders";
import DiscordPipeline from "../../../lib";
import { Command } from "../../../types/discord";
import { interactionReplyEphemeral } from "../../global/steps/interactionReplyEphemeral";
import { getLiveRoleConfiguration } from "../steps/getConfiguration";
import { handleLiveRoleSubcommands } from "../steps/handleSubcommands";

const liveRoleSetupCommand: Command = {
	data: new SlashCommandBuilder()
		.setName("setup-live-role")
		.setDescription("Setup a live role when your members that go live")
		.addSubcommand(subcommand =>
			subcommand
				.setName("enable")
				.setDescription("Enable live role")
				.addRoleOption(option =>
					option
						.setName("role")
						.setDescription("Role to enable")
						.setRequired(true)
				)
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName("edit")
				.setDescription("Edit live role")
				.addRoleOption(option =>
					option
						.setName("role")
						.setDescription("Role to edit")
						.setRequired(true)
				)
		)
		.addSubcommand(subcommand =>
			subcommand.setName("disable").setDescription("Disable live role")
		),
	execute: new DiscordPipeline.CommandInteraction()
		.pipe(getLiveRoleConfiguration)
		.match(handleLiveRoleSubcommands)
		.pipe(interactionReplyEphemeral)
		.compose(),
};

export default liveRoleSetupCommand;
