import Discord from "discord.js";
import { Character } from "../Character";
import { listOfTeammates } from "../helpers/listOfTeammates";
import { Player } from "../Player";
import { CharacterModel } from "./CharacterModel";

export class Mason extends CharacterModel {
	name = Character.MASON;
	description = "You will wake and look for the other mason.";
	image =
		"https://cf.geekdo-images.com/imagepage/img/FeKsR8xD1jOgzFNx-V2Y-qIxT54=/fit-in/900x600/filters:no_upscale()/pic4462591.png";

	protected maxAmount = 2;

	nightAction = true;

	nightActionDM(
		player: Player,
		players: Player[]
	): Discord.MessageEmbedOptions {
		return {
			...this.nightActionCommon(),
			title: `${this.nightActionTitleRole(player)}, this is your team:`,
			description: listOfTeammates(player, Character.MASON, players),
		};
	}
}
