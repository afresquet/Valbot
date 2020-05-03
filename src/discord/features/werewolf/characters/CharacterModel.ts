import Discord from "discord.js";
import { capitalize } from "../../../../helpers/capitalize";
import { clamp } from "../../../../helpers/clamp";
import { Character } from "../Character";
import { Player } from "../Player";

export abstract class CharacterModel {
	abstract name: Character;
	abstract description: string;
	abstract image: string;

	amount = 0;
	protected maxAmount = 1;

	abstract nightAction: boolean;

	manageAmount(value: number) {
		this.amount = clamp(this.amount + value, 0, this.maxAmount);
	}

	abstract nightActionDM(
		player: Player,
		players: Player[],
		centerCards?: Character[]
	): Discord.MessageEmbedOptions;

	protected nightActionTitleRole(player: Player) {
		if (player.role !== Character.DOPPELGANGER) return capitalize(player.role);

		return `Doppelganger-${capitalize(
			(player as Player<Character.DOPPELGANGER>).action.role.character
		)}`;
	}

	protected nightActionCommon(): Discord.MessageEmbedOptions {
		return {
			description: "React to this message with your choice!",
			footer: { text: "This message will expire soon, act fast!" },
			thumbnail: { url: this.image },
		};
	}
}
