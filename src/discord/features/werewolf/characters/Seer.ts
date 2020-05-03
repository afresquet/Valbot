import Discord from "discord.js";
import { characters } from ".";
import { capitalize } from "../../../../helpers/capitalize";
import { Character } from "../Character";
import { centerEmojis } from "../emojis";
import { centerCardPosition } from "../helpers/centerCardPosition";
import { findPlayerById } from "../helpers/findPlayerById";
import { listOfEveryone } from "../helpers/listOfEveryone";
import { Player } from "../Player";
import { CharacterModel } from "./CharacterModel";

export class Seer extends CharacterModel {
	name = Character.SEER;
	description =
		"You will view either two of the center roles, or one role from any other player.";
	image =
		"https://cf.geekdo-images.com/imagepage/img/Y5Kj8KnsVPX9uJBn2mRw64WUzY4=/fit-in/900x600/filters:no_upscale()/pic4462604.png";

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

		if (
			player.isDoppelganger
				? doppelgangerSeer.action?.role?.action?.player
				: seer.action?.player
		) {
			const targetId = player.isDoppelganger
				? doppelgangerSeer.action.role.action.player!
				: seer.action.player!;
			const target = findPlayerById(players, targetId)!;

			return {
				...this.nightActionCommon,
				title: `${this.nightActionTitleRole(player)}, this is ${
					target.member.displayName
				}'s role:`,
				description: capitalize(target.currentRole!),
				image: {
					url: characters.get(target.currentRole!)!.image,
				},
			};
		} else if (
			player.isDoppelganger
				? doppelgangerSeer.action?.role?.action?.first &&
				  !doppelgangerSeer.action?.role?.action?.second
				: seer.action?.first && !seer.action?.second
		) {
			const first = player.isDoppelganger
				? doppelgangerSeer.action.role.action.first!
				: seer.action.first!;

			return {
				...this.nightActionCommon,
				title: `${this.nightActionTitleRole(
					player
				)}, choose another center role to view.`,
				description: `You already chose to view the role on the ${centerCardPosition(
					first
				)}.`,
			};
		} else if (
			player.isDoppelganger
				? doppelgangerSeer.action?.role?.action?.first &&
				  doppelgangerSeer.action?.role?.action?.second
				: seer.action?.first && seer.action?.second
		) {
			const first = player.isDoppelganger
				? doppelgangerSeer.action.role.action.first!
				: seer.action.first!;
			const second = player.isDoppelganger
				? doppelgangerSeer.action.role.action.second!
				: seer.action.second!;

			return {
				...this.nightActionCommon,
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
			...this.nightActionCommon,
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

	async handleReaction(
		player: Player,
		target: Player,
		_players: Player[],
		_centerCards: Character[],
		{ playerIndex, centerIndex }: { playerIndex: number; centerIndex: number }
	) {
		const seer = player as Player<Character.SEER>;
		const doppelgangerSeer = player as Player<
			Character.DOPPELGANGER,
			Character.SEER
		>;

		let action: typeof seer.action = {};

		if (player.isDoppelganger && doppelgangerSeer.action?.role?.action) {
			action = doppelgangerSeer.action.role.action;
		} else if (player.role === Character.SEER && seer.action) {
			action = seer.action;
		}

		if (playerIndex !== -1) {
			if (action.player || action.first || action.second) return;

			action.player = target.member.id;
		} else if (centerIndex !== -1) {
			if (action.player) return;

			if (!action.first) {
				action.first = centerIndex;
			} else if (action.first !== centerIndex && !action.second) {
				action.second = centerIndex;
			} else {
				return;
			}
		}

		if (player.isDoppelganger) {
			doppelgangerSeer.action.role.action = action;
		} else {
			seer.action = action;
		}
	}
}
