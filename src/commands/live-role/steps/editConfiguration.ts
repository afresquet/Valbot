import { CommandPipeline } from "../../../lib/custom-pipelines/command/command-pipeline";
import { LiveRoleModel } from "../../../schemas/LiveRole";

export const editLiveRoleConfiguration: CommandPipeline.Step<
	unknown,
	Promise<void>
> = async (_, interaction) => {
	const { options, guild } = interaction;

	const role = options.getRole("role");

	await LiveRoleModel.updateOne({ guildId: guild!.id }, { roleId: role!.id });
};
