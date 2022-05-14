import { DiscordEventPipeline } from "../../../lib/discord-event-pipeline";
import { ILiveRoleDocument, LiveRoleModel } from "../schemas/LiveRole";

export const createLiveRoleConfiguration: DiscordEventPipeline.CommandInteraction.Pipeline<
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
