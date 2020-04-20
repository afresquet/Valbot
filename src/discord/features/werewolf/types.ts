import Discord from "discord.js";

const NightActionCharacters = [
	"doppelganger",
	"werewolf",
	"minion",
	"mason",
	"seer",
	"robber",
	"troublemaker",
	"drunk",
	"insomniac",
] as const;

export const Characters = [
	...NightActionCharacters,
	"villager",
	"hunter",
	"tanner",
] as const;

export type Character = typeof Characters[number];
export type NightActionCharacter = typeof NightActionCharacters[number];

export interface Player {
	member: Discord.GuildMember;
	role: Character | null;
	master: boolean;
}
