import { CommandPipeline } from "../../../lib/custom-pipelines/command/command-pipeline";
import { LiveRoleModel } from "../../../schemas/LiveRole";

export const disableLiveRoleConfiguration: CommandPipeline.Step<
	unknown,
	Promise<void>
> = async (_, interaction) => {
	await LiveRoleModel.findOneAndDelete({
		guildId: interaction.guild!.id,
	});
};
