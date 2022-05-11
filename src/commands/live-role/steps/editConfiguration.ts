import { InteractionPipeline } from "../../../lib/custom-pipelines/command/interaction-pipeline";
import { LiveRoleModel } from "../../../schemas/LiveRole";

export const editLiveRoleConfiguration: InteractionPipeline.Step<
	unknown,
	Promise<void>
> = async (_, interaction) => {
	const { options, guild } = interaction;

	const role = options.getRole("role");

	await LiveRoleModel.updateOne({ guildId: guild!.id }, { roleId: role!.id });
};
