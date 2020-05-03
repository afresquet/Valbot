import Discord from "discord.js";
import { characters } from ".";
import { capitalize } from "../../../../helpers/capitalize";
import { Character } from "../Character";
import { centerEmojis } from "../emojis";
import { centerCardPosition } from "../helpers/centerCardPosition";
import { findPlayerById } from "../helpers/findPlayerById";
import { isDoppelganger } from "../helpers/isDoppelganger";
import { listOfEveryone } from "../helpers/listOfEveryone";
import { Player } from "../Player";
import { CharacterModel } from "./CharacterModel";

export class Seer extends CharacterModel {
	name = Character.SEER;
	description =
		"You will view either two of the center roles, or one role from any other player.";
	image =
		"https://cf.geekdo-images.com/imagepage/img/Y5Kj8KnsVPX9uJBn2mRw64WUzY4=/fit-in/900x600/filters:no_upscale()/pic4462604.png";

	nightAction = true;
	protected playerReactionsDM = true;
	protected centerCardReactionsDM = true;

	nightActionDM(
		player: Player,
		players: Player[],
		centerCards: Character[]
	): Discord.MessageEmbedOptions {
		const seer = player as Player<Character.SEER>;
		const doppelgangerSeer = player as Player<
			Character.DOPPELGANGER,
			Character.SEER
		>;

		const playerIsDoppelganger = isDoppelganger(player);

		if (
			playerIsDoppelganger
				? doppelgangerSeer.action?.role?.action?.player
				: seer.action?.player
		) {
			const targetId = playerIsDoppelganger
				? doppelgangerSeer.action.role.action.player!
				: seer.action.player!;
			const target = findPlayerById(players, targetId)!;

			return {
				...this.nightActionCommon(),
				title: `${this.nightActionTitleRole(player)}, this is ${
					target.member.displayName
				}'s role:`,
				description: capitalize(target.currentRole!),
				image: {
					url: characters.get(target.currentRole!)!.image,
				},
			};
		} else if (
			playerIsDoppelganger
				? doppelgangerSeer.action?.role?.action?.first &&
				  !doppelgangerSeer.action?.role?.action?.second
				: seer.action?.first && !seer.action?.second
		) {
			const first = playerIsDoppelganger
				? doppelgangerSeer.action.role.action.first!
				: seer.action.first!;

			return {
				...this.nightActionCommon(),
				title: `${this.nightActionTitleRole(
					player
				)}, choose another center role to view.`,
				description: `You already chose to view the role on the ${centerCardPosition(
					first
				)}.`,
			};
		} else if (
			playerIsDoppelganger
				? doppelgangerSeer.action?.role?.action?.first &&
				  doppelgangerSeer.action?.role?.action?.second
				: seer.action?.first && seer.action?.second
		) {
			const first = playerIsDoppelganger
				? doppelgangerSeer.action.role.action.first!
				: seer.action.first!;
			const second = playerIsDoppelganger
				? doppelgangerSeer.action.role.action.second!
				: seer.action.second!;

			return {
				...this.nightActionCommon(),
				title: `${this.nightActionTitleRole(
					player
				)}, these are the center roles you chose to view:`,
				description: undefined,
				fields: [
					{
						name: centerCardPosition(first),
						value: capitalize(centerCards[first]),
					},
					{
						name: centerCardPosition(second),
						value: capitalize(centerCards[second]),
					},
				],
			};
		}

		return {
			...this.nightActionCommon(),
			title: `${this.nightActionTitleRole(
				player
			)}, choose a player to view their role, or view two roles from the center:`,
			fields: [
				{
					name: "Players",
					value: listOfEveryone(players, [player.member.id]),
				},
				{
					name: "Center",
					value: `${centerEmojis[0]} Left\n${centerEmojis[1]} Middle\n${centerEmojis[2]} Right`,
				},
			],
		};
	}
}
