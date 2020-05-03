import Discord from "discord.js";
import { Character } from "../Character";
import { centerEmojis } from "../emojis";
import { centerCardPosition } from "../helpers/centerCardPosition";
import { isDoppelganger } from "../helpers/isDoppelganger";
import { Player } from "../Player";
import { CharacterModel } from "./CharacterModel";

export class Drunk extends CharacterModel {
	name = Character.DRUNK;
	description =
		"You will exchange your role with a role from the center, but you will not view your new role.";
	image =
		"https://cf.geekdo-images.com/imagepage/img/IC7i93WsW03tEbcXHmeV6OxEr_c=/fit-in/900x600/filters:no_upscale()/pic4462584.png";

	nightAction = true;

	nightActionDM(player: Player): Discord.MessageEmbedOptions {
		const drunk = player as Player<Character.DRUNK>;
		const doppelgangerDrunk = player as Player<
			Character.DOPPELGANGER,
			Character.DRUNK
		>;

		if (
			isDoppelganger(player)
				? doppelgangerDrunk.action?.role?.action?.center
				: drunk.action?.center
		) {
			const centerCard = isDoppelganger(player)
				? doppelgangerDrunk.action.role.action.center
				: drunk.action.center;

			return {
				...this.nightActionCommon(),
				title: `${this.nightActionTitleRole(
					player
				)}, you chose to become the role in the ${centerCardPosition(
					centerCard
				)}.`,
				description: undefined,
			};
		}

		return {
			...this.nightActionCommon(),
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
}
