import Discord from "discord.js";
import { Character } from "../Character";
import { centerEmojis } from "../emojis";
import { centerCardPosition } from "../helpers/centerCardPosition";
import { Player } from "../Player";
import { CharacterModel } from "./CharacterModel";

export class Drunk extends CharacterModel {
	name = Character.DRUNK;
	description =
		"You will exchange your role with a role from the center, but you will not view your new role.";
	image =
		"https://cf.geekdo-images.com/imagepage/img/IC7i93WsW03tEbcXHmeV6OxEr_c=/fit-in/900x600/filters:no_upscale()/pic4462584.png";

	nightAction = true;
	protected centerCardReactionsDM = true;

	nightActionDM(player: Player): Discord.MessageEmbedOptions {
		const drunk = player as Player<Character.DRUNK>;
		const doppelgangerDrunk = player as Player<
			Character.DOPPELGANGER,
			Character.DRUNK
		>;

		if (
			player.isDoppelganger
				? doppelgangerDrunk.action?.role?.action?.center
				: drunk.action?.center
		) {
			const centerCard = player.isDoppelganger
				? doppelgangerDrunk.action.role.action.center
				: drunk.action.center;

			return {
				...this.nightActionCommon,
				title: `${this.nightActionTitleRole(
					player
				)}, you chose to become the role in the ${centerCardPosition(
					centerCard
				)}.`,
				description: undefined,
			};
		}

		return {
			...this.nightActionCommon,
			title: `${this.nightActionTitleRole(
				player
			)}, choose a role from the center to become that role:`,
			fields: [
				{
					name: "Center roles",
					value: `${centerEmojis[0]} Left\n${centerEmojis[1]} Middle\n${centerEmojis[2]} Right`,
				},
			],
		};
	}

	async handleReaction(
		player: Player,
		_target: Player,
		_players: Player[],
		centerCards: Character[],
		{ centerIndex }: { centerIndex: number }
	) {
		if (centerIndex === -1) return;

		const drunk = player as Player<Character.DRUNK>;
		const doppelgangerDrunk = player as Player<
			Character.DOPPELGANGER,
			Character.DRUNK
		>;

		if (
			player.isDoppelganger
				? doppelgangerDrunk.action?.role?.action
				: drunk.action
		)
			return;

		const action: typeof drunk.action = { center: centerIndex };

		if (player.isDoppelganger) {
			doppelgangerDrunk.action.role.action = action;
		} else {
			drunk.action = action;
		}

		[player.currentRole, centerCards[centerIndex]] = [
			centerCards[centerIndex],
			player.currentRole!,
		];
	}
}
