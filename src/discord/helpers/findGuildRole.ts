import Discord from "discord.js";

export const findGuildRole = (
	guild: Discord.Guild,
	name: string
): Discord.Role | undefined => {
	return guild.roles.cache.find(role => role.name === name);
};
