import Discord from "discord.js";
import { prefixChannel } from "../../helpers/prefixString";
import { DiscordFeature } from "../../types/Feature";
import { findGuildRole } from "../tools/findGuildRole";

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
	discord.on("ready", async () => {
		for (const guild of discord.guilds.cache.array()) {
			const liveRole = findGuildRole(guild, prefixChannel("live"));

			if (!liveRole) continue;

			for (const member of guild.members.cache.array()) {
				const hasLiveRole = guildMemberHasRole(member, liveRole);
				const isStreaming = guildMemberIsSteraming(member);

				if (!hasLiveRole && isStreaming) {
					await member.roles.add(liveRole);
				} else if (hasLiveRole && !isStreaming) {
					await member.roles.remove(liveRole);
				}
			}
		}
	});

	discord.on("presenceUpdate", async (_, newPresence) => {
		const liveRole = findGuildRole(newPresence.guild!, prefixChannel("live"));

		if (!liveRole) return;

		const hasLiveRole = guildMemberHasRole(newPresence.member!, liveRole);
		const isStreaming = guildMemberIsSteraming(newPresence.member!);

		if (!hasLiveRole && isStreaming) {
			await newPresence.member?.roles.add(liveRole);
		} else if (hasLiveRole && !isStreaming) {
			await newPresence.member?.roles.remove(liveRole);
		}
	});
};
