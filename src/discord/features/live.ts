import Discord from "discord.js";
import { DiscordFeature } from "../../types/Feature";
import { findGuildRole } from "../tools/findGuildRole";
import { prefixChannel } from "../tools/prefixChannel";

const guildMemberHasRole = (
	member: Discord.GuildMember,
	role: Discord.Role
): boolean => {
	return !!member.roles.cache.find(r => r === role);
};

const guildMemberIsSteraming = (member: Discord.GuildMember): boolean => {
	return !!member.presence.activities.find(
		activity => activity.type === "STREAMING"
	);
};

export const live: DiscordFeature = discord => {
	discord.on("ready", () => {
		for (const guild of discord.guilds.cache.array()) {
			const liveRole = findGuildRole(guild, prefixChannel("live"));

			if (!liveRole) continue;

			for (const member of guild.members.cache.array()) {
				const hasLiveRole = guildMemberHasRole(member, liveRole);
				const isStreaming = guildMemberIsSteraming(member);

				if (!hasLiveRole && isStreaming) {
					member.roles.add(liveRole);
				} else if (hasLiveRole && !isStreaming) {
					member.roles.remove(liveRole);
				}
			}
		}
	});

	discord.on("presenceUpdate", (_, newPresence) => {
		const liveRole = findGuildRole(newPresence.guild!, prefixChannel("live"));

		if (!liveRole) return;

		const hasLiveRole = guildMemberHasRole(newPresence.member!, liveRole);
		const isStreaming = guildMemberIsSteraming(newPresence.member!);

		if (!hasLiveRole && isStreaming) {
			newPresence.member!.roles.add(liveRole);
		} else if (hasLiveRole && !isStreaming) {
			newPresence.member!.roles.remove(liveRole);
		}
	});
};
