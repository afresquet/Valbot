import Discord from "discord.js";
import { delay } from "../../../../helpers/delay";
import { Character } from "../Character";
import { listOfTeammates } from "../helpers/listOfTeammates";
import { Player } from "../Player";
import { Sound } from "../Sounds";
import { CharacterModel } from "./CharacterModel";

export class Werewolf extends CharacterModel {
	name = Character.WEREWOLF;
	description =
		"You will wake and look for the other werewolves. You will win if no werewolves are killed.";
	image =
		"https://cf.geekdo-images.com/imagepage/img/tgyrEJ3RbB_sZlme9eHu-ZKQ-vo=/fit-in/900x600/filters:no_upscale()/pic4462616.png";

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

		const werewolves = players.filter(player =>
			player.isDoppelganger
				? (player as Player<Character.DOPPELGANGER>).action.role.character ===
				  this.name
				: player.role === this.name
		);

		await playSound(this.name, Sound.WAKE);

		this.privateMessages = await Promise.all(
			werewolves.map(werewolf =>
				werewolf.member.send(createEmbed(this.nightActionDM(werewolf, players)))
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
			description: listOfTeammates(player, Character.WEREWOLF, players),
		};
	}
}
