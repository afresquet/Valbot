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

export type CharacterEmoji = {
	character: Character;
	emoji: Discord.GuildEmoji;
};
