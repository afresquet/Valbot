import Discord from "discord.js";

export enum GameState {
	NOT_PLAYING,
	PREPARATION,
	ROLE_ASSIGNING,
	NIGHT,
	DAY,
	VOTING,
}

export enum Character {
	DOPPELGANGER = "doppelganger",
	WEREWOLF = "werewolf",
	MINION = "minion",
	MASON = "mason",
	SEER = "seer",
	ROBBER = "robber",
	TROUBLEMAKER = "troublemaker",
	DRUNK = "drunk",
	INSOMNIAC = "insomniac",
	VILLAGER = "villager",
	HUNTER = "hunter",
	TANNER = "tanner",
}

export const NightActionCharacters = [
	Character.DOPPELGANGER,
	Character.WEREWOLF,
	Character.MINION,
	Character.MASON,
	Character.SEER,
	Character.ROBBER,
	Character.TROUBLEMAKER,
	Character.DRUNK,
	Character.INSOMNIAC,
] as const;

export const Characters = [
	...NightActionCharacters,
	Character.VILLAGER,
	Character.HUNTER,
	Character.TANNER,
] as const;

export type NightActionCharacter = typeof NightActionCharacters[number];

export type CharacterCount = { character: Character; amount: number };

export type Actions<
	T extends Character | null,
	D extends Character = Character
> = T extends "doppelganger"
	? DoppelgangerAction<D>
	: T extends "seer"
	? SeerAction
	: T extends "robber"
	? RobberAction
	: T extends "troublemaker"
	? TroublemakerAction
	: T extends "drunk"
	? DrunkAction
	: null;

type DoppelgangerAction<T extends Character> = {
	player: string;
	ready: boolean;
	role: {
		character: T;
		action: Actions<T>;
	};
};

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

export type CharacterEmoji = {
	character: Character;
	emoji: Discord.GuildEmoji;
};
