import Discord from "discord.js";

export type GameState =
	| "NOT_PLAYING"
	| "PREPARATION"
	| "ROLE_ASSIGNING"
	| "NIGHT"
	| "DAY"
	| "VOTING";

export const NightActionCharacters = [
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
	initialRole: Character | null;
	role: Character | null;
	master: boolean;
	killing: number | null;
}

export const numberEmojis = [
	"1️⃣",
	"2️⃣",
	"3️⃣",
	"4️⃣",
	"5️⃣",
	"6️⃣",
	"7️⃣",
	"8️⃣",
	"9️⃣",
	"🔟",
];
