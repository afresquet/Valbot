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

export type CharactersState = { character: Character; amount: number }[];

export interface Player<T extends Character | null = Character | null> {
	master: boolean;
	member: Discord.GuildMember;
	initialRole: T;
	role: Character | null;
	action: Actions<T>;
	killing: number | null;
}

type Actions<T extends Character | null> = T extends "seer"
	? SeerAction
	: T extends "robber"
	? RobberAction
	: T extends "troublemaker"
	? TroublemakerAction
	: T extends "drunk"
	? DrunkAction
	: null;

type SeerAction = {
	player: string | null;
	first: number | null;
	second: number | null;
};

type RobberAction = {
	player: string;
};

type TroublemakerAction = {
	first: string | null;
	second: string | null;
};

type DrunkAction = {
	center: number;
};
