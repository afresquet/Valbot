import type { ActivityType, GuildMember, Role } from "discord.js";

export const guildMemberHasRole = (
	member: GuildMember,
	role: Role
): boolean => {
	return !!member.roles.cache.find(r => r === role);
};

export const guildMemberHasActivity = (
	member: GuildMember,
	type: ActivityType
): boolean => {
	return !!member.presence?.activities?.find(
		activity => activity.type === type
	);
};
