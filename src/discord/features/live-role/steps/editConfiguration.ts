import { DiscordTypePipe } from "../../../lib";
import { LiveRoleModel } from "../schemas/LiveRole";

export const editLiveRoleConfiguration: DiscordTypePipe.CommandInteraction.Function<
	unknown,
	Promise<void>
> = async (_, { interaction }) => {
	const { options, guild } = interaction;

	const role = options.getRole("role");

	await LiveRoleModel.updateOne({ guildId: guild!.id }, { roleId: role!.id });
};
