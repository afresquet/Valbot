import { Role } from "discord.js";
import { DiscordEventPipeline } from "../../../lib/discord-event-pipeline";
import { LiveRoleModel } from "../schemas/LiveRole";

export const getRole: DiscordEventPipeline.Step<
	"presenceUpdate",
	unknown,
	Role | undefined
> = (_, { newPresence }) => LiveRoleModel.findRoleByGuild(newPresence.guild!);
