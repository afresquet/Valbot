import { DiscordEventPipeline } from "../../../lib/custom-pipelines/discord-event/discord-event-pipeline";
import { ILiveRoleDocument, LiveRoleModel } from "../../../schemas/LiveRole";

export const createLiveRoleConfiguration: DiscordEventPipeline.CommandInteraction.Step<
	unknown,
	ILiveRoleDocument
> = (_, { interaction }) => {
	const { options, guild } = interaction;

	const role = options.getRole("role");

	return LiveRoleModel.create({
		guildId: guild!.id,
		roleId: role!.id,
	});
};
