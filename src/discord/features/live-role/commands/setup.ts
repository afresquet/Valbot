import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { Role } from "discord.js";
import DiscordPipeline from "../../../lib";
import { SetupCommand } from "../../../types/discord";
import { getOptions } from "../../global/steps/getOptions";
import { interactionReplyEphemeral } from "../../global/steps/interactionReplyEphemeral";
import { getLiveRoleConfiguration } from "../steps/getConfiguration";
import { handleLiveRoleSubcommands } from "../steps/handleSubcommands";

const liveRoleSetupCommand: SetupCommand = {
	data: new SlashCommandSubcommandBuilder()
		.setName("live-role")
		.setDescription(
			"Setup a live role when your members that go live, leave empty to disable."
		)
		.addRoleOption(option =>
			option.setName("role").setDescription("Role to enable")
		),
	execute: new DiscordPipeline.CommandInteraction()
		.context(getLiveRoleConfiguration)
		.pipe(getOptions(option => option.getRole("role") as Role | null))
		.match(handleLiveRoleSubcommands)
		.pipe(interactionReplyEphemeral)
		.compose(),
};

export default liveRoleSetupCommand;
