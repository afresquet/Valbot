import Discord from "discord.js";
import { Character } from "../Character";
import { numberEmojis } from "../emojis";
import { findPlayerById } from "../helpers/findPlayerById";
import { isDoppelganger } from "../helpers/isDoppelganger";
import { listOfEveryone } from "../helpers/listOfEveryone";
import { Player } from "../Player";
import { CharacterModel } from "./CharacterModel";

export class Troublemaker extends CharacterModel {
	name = Character.TROUBLEMAKER;
	description = "You will exchange roles between any two other roles.";
	image =
		"https://cf.geekdo-images.com/imagepage/img/2gB7ClAu4p7rrs8ipGnNAfOOO-w=/fit-in/900x600/filters:no_upscale()/pic4462611.png";

	nightAction = true;

	nightActionDM(
		player: Player,
		players: Player[]
	): Discord.MessageEmbedOptions {
		const troublemaker = player as Player<Character.TROUBLEMAKER>;
		const doppelgangerTroublemaker = player as Player<
			Character.DOPPELGANGER,
			Character.TROUBLEMAKER
		>;

		const playerIsDoppelganger = isDoppelganger(player);

		if (
			playerIsDoppelganger
				? doppelgangerTroublemaker.action?.role?.action?.first &&
				  !doppelgangerTroublemaker.action?.role?.action?.second
				: troublemaker.action?.first && !troublemaker.action?.second
		) {
			const firstId = playerIsDoppelganger
				? doppelgangerTroublemaker.action.role.action.first!
				: troublemaker.action.first!;
			const first = findPlayerById(players, firstId)!;
			const firstIndex = players.indexOf(first);

			return {
				...this.nightActionCommon(),
				title: `${this.nightActionTitleRole(
					player
				)}, choose two other players to swap their roles:`,
				fields: [
					{
						name: "Picked",
						value: `${numberEmojis[firstIndex]} ${first.member.displayName}`,
					},
					{
						name: "Players",
						value: listOfEveryone(players, [player.member.id]),
					},
				],
			};
		} else if (
			playerIsDoppelganger
				? doppelgangerTroublemaker.action?.role?.action?.first &&
				  doppelgangerTroublemaker.action?.role?.action?.second
				: troublemaker.action?.first && troublemaker.action?.second
		) {
			const firstId = playerIsDoppelganger
				? doppelgangerTroublemaker.action.role.action.first!
				: troublemaker.action.first!;
			const first = findPlayerById(players, firstId)!;
			const firstIndex = players.indexOf(first);

			const secondId = playerIsDoppelganger
				? doppelgangerTroublemaker.action.role.action.second!
				: troublemaker.action.second!;
			const second = findPlayerById(players, secondId)!;
			const secondIndex = players.indexOf(second);

			return {
				...this.nightActionCommon(),
				title: `${this.nightActionTitleRole(
					player
				)}, you swapped the roles of these two players:`,
				description: `${numberEmojis[firstIndex]} ${first.member.displayName}\n${numberEmojis[secondIndex]} ${second.member.displayName}`,
			};
		}

		return {
			...this.nightActionCommon(),
			title: `${this.nightActionTitleRole(
				player
			)}, choose two other players to swap their roles:`,
			fields: [
				{
					name: "Picked",
					value: "No players have been picked yet.",
				},
				{
					name: "Players",
					value: listOfEveryone(players, [player.member.id]),
				},
			],
		};
	}
}
