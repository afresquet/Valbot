import Discord from "discord.js";
import { Character } from "./Character";

export enum GameState {
	NOT_PLAYING,
	PREPARATION,
	ROLE_ASSIGNING,
	NIGHT,
	DAY,
	VOTING,
}

export type CharacterCount = { character: Character; amount: number };

export type CharacterEmoji = {
	character: Character;
	emoji: Discord.GuildEmoji;
};
