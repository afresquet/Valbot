import Discord from "discord.js";
import { DiscordFeature } from "../../types/Feature";

const findGuildRole = (
	guild: Discord.Guild,
	name: string
): Discord.Role | undefined => {
	return guild.roles.cache.find(role => role.name === name);
};

const guildMemberHasRole = (
	member: Discord.GuildMember,
	name: string
): boolean => {
	return !!member.roles.cache.find(role => role.name === name);
};

const guildMemberIsSteraming = (member: Discord.GuildMember): boolean => {
	return !!member.presence.activities.find(
		activity => activity.type === "STREAMING"
	);
};

export const live: DiscordFeature = (discord: Discord.Client) => {
	discord.on("ready", () => {
		for (const guild of discord.guilds.cache.array()) {
			const liveRole = findGuildRole(guild, "live");

			if (!liveRole) continue;

			for (const member of guild.members.cache.array()) {
				const hasLiveRole = guildMemberHasRole(member, "live");
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
		const liveRole = findGuildRole(newPresence.guild!, "live");

		if (!liveRole) return;

		const hasLiveRole = guildMemberHasRole(newPresence.member!, "live");
		const isStreaming = guildMemberIsSteraming(newPresence.member!);

		if (!hasLiveRole && isStreaming) {
			newPresence.member!.roles.add(liveRole);
		} else if (hasLiveRole && !isStreaming) {
			newPresence.member!.roles.remove(liveRole);
		}
	});
};
