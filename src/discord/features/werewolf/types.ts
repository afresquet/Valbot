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

export type CharacterEmoji = {
	character: Character;
	emoji: Discord.GuildEmoji;
};
