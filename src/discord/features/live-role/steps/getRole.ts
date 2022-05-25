import { Role } from "discord.js";
import { DiscordTypePipe } from "../../../lib";
import { LiveRoleModel } from "../schemas/LiveRole";

export const getRole: DiscordTypePipe.Function<
	"presenceUpdate",
	unknown,
	Promise<Role | undefined>
> = (_, { newPresence }) => LiveRoleModel.findRoleByGuild(newPresence.guild!);
