import Discord from "discord.js";
import { characters } from ".";
import { capitalize } from "../../../../helpers/capitalize";
import { Character } from "../Character";
import { Player } from "../Player";
import { CharacterModel } from "./CharacterModel";

export class Insomniac extends CharacterModel {
	name = Character.INSOMNIAC;
	description = "You will view your own role.";
	image =
		"https://cf.geekdo-images.com/imagepage/img/RHfz10FGfiYxunbUsJt1_xNwrS4=/fit-in/900x600/filters:no_upscale()/pic4462588.png";

	nightAction = true;

	nightActionDM(player: Player): Discord.MessageEmbedOptions {
		return {
			...this.nightActionCommon(),
			title: `${this.nightActionTitleRole(player)}, this is your role:`,
			description: capitalize(player.currentRole),
			image: {
				url: characters.get(player.currentRole)!.image,
			},
		};
	}
}
