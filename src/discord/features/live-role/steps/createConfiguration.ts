import { DiscordTypePipe } from "../../../lib";
import { ILiveRoleDocument, LiveRoleModel } from "../schemas/LiveRole";

export const createLiveRoleConfiguration: DiscordTypePipe.CommandInteraction.Function<
	unknown,
	Promise<ILiveRoleDocument>
> = (_, { interaction }) => {
	const { options, guild } = interaction;

	const role = options.getRole("role");

	return LiveRoleModel.create({
		guildId: guild!.id,
		roleId: role!.id,
	});
};
