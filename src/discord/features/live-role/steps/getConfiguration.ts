import { DiscordEventPipeline } from "../../../lib/discord-event-pipeline";
import { ILiveRoleDocument, LiveRoleModel } from "../schemas/LiveRole";

export const getLiveRoleConfiguration: DiscordEventPipeline.CommandInteraction.Step<
	unknown,
	ILiveRoleDocument | null
> = (_, { interaction }) => LiveRoleModel.findByGuild(interaction.guild!);
