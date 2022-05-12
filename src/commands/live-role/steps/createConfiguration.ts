import { InteractionPipeline } from "../../../lib/custom-pipelines/command/interaction-pipeline";
import { ILiveRoleDocument, LiveRoleModel } from "../../../schemas/LiveRole";

export const createLiveRoleConfiguration: InteractionPipeline.Step<
	unknown,
	Promise<ILiveRoleDocument>
> = (_, interaction) => {
	const { options, guild } = interaction;

	const role = options.getRole("role");

	return LiveRoleModel.create({
		guildId: guild!.id,
		roleId: role!.id,
	});
};