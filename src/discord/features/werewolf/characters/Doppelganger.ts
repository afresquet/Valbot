import Discord from "discord.js";
import { characters } from ".";
import { Character } from "../Character";
import { findPlayerById } from "../helpers/findPlayerById";
import { listOfEveryone } from "../helpers/listOfEveryone";
import { Player } from "../Player";
import { CharacterModel } from "./CharacterModel";

export class Doppelganger extends CharacterModel {
	name = Character.DOPPELGANGER;
	description =
		"You will look at any other player's card and will become that role yourself, in addition to the player with that role.";
	image =
		"https://cf.geekdo-images.com/imagepage/img/rP3xvC-HFqIonPj5mmr6_1lJYJ8=/fit-in/900x600/filters:no_upscale()/pic4462582.png";

	nightAction = true;
	protected playerReactionsDM = true;

	nightActionDM(
		player: Player,
		players: Player[]
	): Discord.MessageEmbedOptions {
		const doppelganger = player as Player<Character.DOPPELGANGER>;

		if (doppelganger.action) {
			const target = findPlayerById(players, doppelganger.action.player)!;

			const hasAction = [
				Character.MINION,
				Character.SEER,
				Character.ROBBER,
				Character.TROUBLEMAKER,
				Character.DRUNK,
			].includes(doppelganger.action.role.character);

			return {
				...this.nightActionCommon(),
				title: `Doppelganger, you copied the role from ${target.member.displayName}:`,
				description: `You became a ${doppelganger.action.role.character}! ${
					hasAction ? "Your action will show up right after this message." : ""
				}`,
				image: {
					url: characters.get(doppelganger.action.role.character)!.image,
				},
			};
		}

		return {
			...this.nightActionCommon(),
			title: "Doppelganger, choose a player to become their role.",
			description: listOfEveryone(players, [doppelganger.member.id]),
		};
	}
}
