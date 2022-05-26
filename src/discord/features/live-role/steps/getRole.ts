import { Role } from "discord.js";
import { DiscordTypePipe } from "../../../lib";

export const getRole: DiscordTypePipe.Function<
	"presenceUpdate",
	unknown,
	Promise<Role | undefined>
> = (_, { newPresence }, { models: { LiveRoleModel } }) =>
	LiveRoleModel.findRoleByGuild(newPresence.guild!);
