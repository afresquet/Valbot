import { DiscordEventPipeline } from "../../../lib/custom-pipelines/discord-event/discord-event-pipeline";
import { ILiveRoleDocument, LiveRoleModel } from "../../../schemas/LiveRole";

export const getLiveRoleConfiguration: DiscordEventPipeline.Step<
	"interactionCreate",
	unknown,
	ILiveRoleDocument | undefined
> = (_, { interaction }) => LiveRoleModel.findByGuild(interaction.guild!);
