import Discord from "discord.js";
import { Character } from "../Character";
import { listOfTeammates } from "../helpers/listOfTeammates";
import { Player } from "../Player";
import { CharacterModel } from "./CharacterModel";

export class Minion extends CharacterModel {
	name = Character.MINION;
	description =
		"You will know who the werewolves are. You will win if no werewolves are killed, even if you are killed.";
	image =
		"https://cf.geekdo-images.com/imagepage/img/ePtQq2ZqGJ06HpM5I6CaYp3FixA=/fit-in/900x600/filters:no_upscale()/pic4462593.png";

	nightAction = true;

	nightActionDM(
		player: Player,
		players: Player[]
	): Discord.MessageEmbedOptions {
		return {
			...this.nightActionCommon(),
			title: `${this.nightActionTitleRole(player)}, these are the werewolves:`,
			description: listOfTeammates(player, Character.WEREWOLF, players),
		};
	}
}
