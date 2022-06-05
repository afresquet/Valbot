import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { ChannelType } from "discord-api-types/v9";
import { GuildBasedChannel } from "discord.js";
import DiscordPipeline from "../../../lib";
import { SetupCommand } from "../../../types/discord";
import { getOptions } from "../../global/steps/getOptions";
import { interactionReplyEphemeral } from "../../global/steps/interactionReplyEphemeral";
import { getSuggestionsConfiguration } from "../steps/getConfiguration";
import { handleSetupSuggestionsSubcommands } from "../steps/handleSetupSubcommands";

const suggestionsSetupCommand: SetupCommand = {
	data: new SlashCommandSubcommandBuilder()
		.setName("suggestions")
		.setDescription("Setup a suggestions channel, leave empty to disable.")
		.addChannelOption(option =>
			option
				.setName("channel")
				.setDescription("The channel to post suggestions to")
				.addChannelTypes(ChannelType.GuildText)
		),
	execute: new DiscordPipeline.CommandInteraction()
		.context(getSuggestionsConfiguration)
		.pipe(
			getOptions(
				option => option.getChannel("channel") as GuildBasedChannel | null
			)
		)
		.match(handleSetupSuggestionsSubcommands)
		.pipe(interactionReplyEphemeral)
		.compose(),
};

export default suggestionsSetupCommand;
