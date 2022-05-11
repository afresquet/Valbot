import { SlashCommandBuilder } from "@discordjs/builders";
import { ChannelType } from "discord.js/node_modules/discord-api-types/v9";
import { InteractionPipelineBuilder } from "../../lib/custom-pipelines/command/InteractionPipeline";
import { interactionReplyEphemeral } from "../../lib/custom-pipelines/steps/interactionReplyEphemeral";
import { Command } from "../../types/discord";
import { getSuggestionsConfiguration } from "./steps/getConfiguration";
import { handleSetupSuggestionsSubcommands } from "./steps/handleSetupSubcommands";

const suggestionsSetupCommand: Command = {
	data: new SlashCommandBuilder()
		.setName("setup-suggestions")
		.setDescription("Setup suggestions for this server")
		.addSubcommand(subcommand =>
			subcommand
				.setName("enable")
				.setDescription("Enable suggestions")
				.addChannelOption(option =>
					option
						.setName("channel")
						.setDescription("The channel to post suggestions to")
						.setRequired(true)
						.addChannelType(ChannelType.GuildText)
				)
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName("edit")
				.setDescription("Edit suggestions' channel")
				.addChannelOption(option =>
					option
						.setName("channel")
						.setDescription("The new channel to post suggestions to")
						.setRequired(true)
						.addChannelType(ChannelType.GuildText)
				)
		)
		.addSubcommand(subcommand =>
			subcommand.setName("disable").setDescription("Disable suggestions")
		),
	execute: new InteractionPipelineBuilder()
		.pipe(getSuggestionsConfiguration)
		.pipe(handleSetupSuggestionsSubcommands)
		.pipe(interactionReplyEphemeral)
		.build(),
};

export default suggestionsSetupCommand;
