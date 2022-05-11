import { InteractionPipeline } from "../../../lib/custom-pipelines/command/interaction-pipeline";
import { ILiveRoleDocument, LiveRoleModel } from "../../../schemas/LiveRole";

export const getLiveRoleConfiguration: InteractionPipeline.Step<
	unknown,
	ILiveRoleDocument | undefined
> = (_, interaction) => LiveRoleModel.findByGuild(interaction.guild!);
