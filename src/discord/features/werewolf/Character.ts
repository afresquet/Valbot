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
