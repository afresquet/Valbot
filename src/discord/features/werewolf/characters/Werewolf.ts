import Discord from "discord.js";
import { Character } from "../Character";
import { listOfTeammates } from "../helpers/listOfTeammates";
import { Player } from "../Player";
import { CharacterModel } from "./CharacterModel";

export class Werewolf extends CharacterModel {
	name = Character.WEREWOLF;
	description =
		"You will wake and look for the other werewolves. You will win if no werewolves are killed.";
	image =
		"https://cf.geekdo-images.com/imagepage/img/tgyrEJ3RbB_sZlme9eHu-ZKQ-vo=/fit-in/900x600/filters:no_upscale()/pic4462616.png";

	nightAction = true;

	nightActionDM(
		player: Player,
		players: Player[]
	): Discord.MessageEmbedOptions {
		return {
			...this.nightActionCommon(),
			title: `${this.nightActionTitleRole(player)}, this is your team:`,
			description: listOfTeammates(player, Character.WEREWOLF, players),
		};
	}
}
