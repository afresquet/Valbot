import { SlashCommandBuilder } from "@discordjs/builders";
import { DiscordEventPipelineBuilder } from "../../lib/custom-pipelines/discord-event/DiscordEventPipeline";
import { interactionReplyEphemeral } from "../../lib/custom-pipelines/steps/interactionReplyEphemeral";
import { Command } from "../../types/discord";
import { getLiveRoleConfiguration } from "./steps/getConfiguration";
import { handleLiveRoleSubcommands } from "./steps/handleSubcommands";

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
	execute: new DiscordEventPipelineBuilder.CommandInteraction()
		.pipe(getLiveRoleConfiguration)
		.pipe(handleLiveRoleSubcommands)
		.pipe(interactionReplyEphemeral)
		.build(),
};

export default liveRoleSetupCommand;
