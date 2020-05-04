import Discord from "discord.js";
import { Character } from "./Character";
import { GameState } from "./GameState";
import { PlayerMap } from "./Player";
import { WerewolfAudioManager } from "./WerewolfAudioManager";

export interface WerewolfContext {
	textChannel: Discord.TextChannel;
	audioManager: WerewolfAudioManager;
	gameState: GameState;
	gameMessage?: Discord.Message;
	gameTimer: number;
	roleTimer: number;
	players: PlayerMap;
	centerCards: Character[];
	createEmbed: (options: Discord.MessageEmbedOptions) => Discord.MessageEmbed;
}
