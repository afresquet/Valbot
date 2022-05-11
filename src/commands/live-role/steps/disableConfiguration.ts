import { InteractionPipeline } from "../../../lib/custom-pipelines/command/interaction-pipeline";
import { LiveRoleModel } from "../../../schemas/LiveRole";

export const disableLiveRoleConfiguration: InteractionPipeline.Step<
	unknown,
	Promise<void>
> = async (_, interaction) => {
	await LiveRoleModel.findOneAndDelete({
		guildId: interaction.guild!.id,
	});
};
