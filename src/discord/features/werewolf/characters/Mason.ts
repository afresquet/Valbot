import Discord from "discord.js";
import { delay } from "../../../../helpers/delay";
import { Character } from "../Character";
import { isDoppelganger } from "../helpers/isDoppelganger";
import { listOfTeammates } from "../helpers/listOfTeammates";
import { Player } from "../Player";
import { Sound } from "../Sounds";
import { CharacterModel } from "./CharacterModel";

export class Mason extends CharacterModel {
	name = Character.MASON;
	description = "You will wake and look for the other mason.";
	image =
		"https://cf.geekdo-images.com/imagepage/img/FeKsR8xD1jOgzFNx-V2Y-qIxT54=/fit-in/900x600/filters:no_upscale()/pic4462591.png";

	protected maxAmount = 2;

	nightAction = true;
	private privateMessages?: Discord.Message[];

	async handleNightAction(
		players: Player[],
		_: Character[],
		roleDelay: number,
		playSound: (character: Character, sound: Sound) => Promise<void>,
		createEmbed: (options: Discord.MessageEmbedOptions) => Discord.MessageEmbed
	) {
		if (this.amount <= 0) return;

		const masons = players.filter(player =>
			isDoppelganger(player)
				? (player as Player<Character.DOPPELGANGER>).action.role.character ===
				  this.name
				: player.role === this.name
		);

		await playSound(this.name, Sound.WAKE);

		this.privateMessages = await Promise.all(
			masons.map(mason =>
				mason.member.send(createEmbed(this.nightActionDM(mason, players)))
			)
		);

		await delay(roleDelay);

		await Promise.all(this.privateMessages.map(message => message.delete()));

		delete this.privateMessages;

		await playSound(this.name, Sound.CLOSE);
	}

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
