import Discord from "discord.js";
import { characters } from ".";
import { capitalize } from "../../../../helpers/capitalize";
import { Character } from "../Character";
import { findPlayerById } from "../helpers/findPlayerById";
import { isDoppelganger } from "../helpers/isDoppelganger";
import { listOfEveryone } from "../helpers/listOfEveryone";
import { Player } from "../Player";
import { CharacterModel } from "./CharacterModel";

export class Robber extends CharacterModel {
	name = Character.ROBBER;
	description =
		"You will exchange your role with another player's role, and will view your new role.";
	image =
		"https://cf.geekdo-images.com/imagepage/img/rv16CisR0fsy8pkEOAAZkGwTsFk=/fit-in/900x600/filters:no_upscale()/pic4462602.png";

	nightAction = true;

	nightActionDM(
		player: Player,
		players: Player[]
	): Discord.MessageEmbedOptions {
		const robber = player as Player<Character.ROBBER>;
		const doppelgangerRobber = player as Player<
			Character.DOPPELGANGER,
			Character.ROBBER
		>;

		if (
			isDoppelganger(player)
				? doppelgangerRobber.action?.role?.action?.player
				: robber.action?.player
		) {
			const targetId = isDoppelganger(player)
				? doppelgangerRobber.action.role.action.player
				: robber.action.player;
			const target = findPlayerById(players, targetId)!;

			return {
				...this.nightActionCommon(),
				title: `You stole the role from ${target.member.displayName}!`,
				description: `You became a ${capitalize(player.currentRole!)}.`,
				image: {
					url: characters.get(player.currentRole!)!.image,
				},
			};
		}

		return {
			...this.nightActionCommon(),
			title: `${this.nightActionTitleRole(
				player
			)}, choose another player to steal their role:`,
			fields: [
				{
					name: "Players",
					value: listOfEveryone(players, [player.member.id]),
				},
			],
		};
	}
}