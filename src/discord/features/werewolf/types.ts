import Discord from "discord.js";

export const Characters = [
	"doppelganger",
	"werewolf",
	"minion",
	"mason",
	"seer",
	"robber",
	"troublemaker",
	"drunk",
	"insomniac",
	"villager",
	"hunter",
	"tanner",
] as const;

export type Character = typeof Characters[number];

export interface Player {
	member: Discord.GuildMember;
	role: Character | null;
	master: boolean;
}
