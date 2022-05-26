import { DiscordTypePipe } from "../../../lib";

export const disableLiveRoleConfiguration: DiscordTypePipe.CommandInteraction.Function<
	unknown,
	Promise<string>
> = async (_, { interaction }, { models: { LiveRoleModel } }) => {
	await LiveRoleModel.findOneAndDelete({
		guildId: interaction.guild!.id,
	});

	return "Live role was disabled.";
};
