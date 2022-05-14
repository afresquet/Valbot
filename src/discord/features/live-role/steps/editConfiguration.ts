import { DiscordEventPipeline } from "../../../lib/discord-event-pipeline";
import { LiveRoleModel } from "../schemas/LiveRole";

export const editLiveRoleConfiguration: DiscordEventPipeline.CommandInteraction.Pipeline<
	unknown,
	Promise<void>
> = async (_, { interaction }) => {
	const { options, guild } = interaction;

	const role = options.getRole("role");

	await LiveRoleModel.updateOne({ guildId: guild!.id }, { roleId: role!.id });
};
