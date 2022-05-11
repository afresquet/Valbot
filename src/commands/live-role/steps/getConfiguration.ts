import { CommandPipeline } from "../../../lib/custom-pipelines/command/command-pipeline";
import { ILiveRoleDocument, LiveRoleModel } from "../../../schemas/LiveRole";

export const getLiveRoleConfiguration: CommandPipeline.Step<
	unknown,
	ILiveRoleDocument | undefined
> = (_, interaction) => LiveRoleModel.findByGuild(interaction.guild!);
