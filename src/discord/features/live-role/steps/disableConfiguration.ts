import { DiscordTypePipe } from "../../../lib";
import { LiveRoleModel } from "../schemas/LiveRole";

export const disableLiveRoleConfiguration: DiscordTypePipe.CommandInteraction.Function<
	unknown,
	Promise<void>
> = async (_, { interaction }) => {
	await LiveRoleModel.findOneAndDelete({
		guildId: interaction.guild!.id,
	});
};
