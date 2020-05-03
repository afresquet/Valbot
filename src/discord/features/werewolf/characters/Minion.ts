import Discord from "discord.js";
import { delay } from "../../../../helpers/delay";
import { Character } from "../Character";
import { listOfTeammates } from "../helpers/listOfTeammates";
import { Player } from "../Player";
import { Sound } from "../Sounds";
import { CharacterModel } from "./CharacterModel";

export class Minion extends CharacterModel {
	name = Character.MINION;
	description =
		"You will know who the werewolves are. You will win if no werewolves are killed, even if you are killed.";
	image =
		"https://cf.geekdo-images.com/imagepage/img/ePtQq2ZqGJ06HpM5I6CaYp3FixA=/fit-in/900x600/filters:no_upscale()/pic4462593.png";

	nightAction = true;

	async handleNightAction(
		players: Player[],
		_centerCards: Character[],
		roleDelay: number,
		playSound: (character: Character, sound: Sound) => Promise<void>,
		createEmbed: (options: Discord.MessageEmbedOptions) => Discord.MessageEmbed
	) {
		if (this.amount <= 0) return;

		const player = players.find(p => p.role === this.name);

		await playSound(this.name, Sound.WAKE);

		this.privateMessage = await player?.member.send(
			createEmbed(this.nightActionDM(player, players))
		);

		await delay(roleDelay);

		await this.privateMessage?.delete();

		delete this.privateMessage;

		await playSound(this.name, Sound.THUMB);

		await playSound(this.name, Sound.CLOSE);
	}

	nightActionDM(
		player: Player,
		players: Player[]
	): Discord.MessageEmbedOptions {
		return {
			...this.nightActionCommon,
			title: `${this.nightActionTitleRole(player)}, these are the werewolves:`,
			description: listOfTeammates(player, Character.WEREWOLF, players),
		};
	}
}
