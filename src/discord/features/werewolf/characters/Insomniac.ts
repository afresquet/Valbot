import Discord from "discord.js";
import { characters } from ".";
import { capitalize } from "../../../../helpers/capitalize";
import { delay } from "../../../../helpers/delay";
import { Character } from "../Character";
import { Player } from "../Player";
import { Sound } from "../Sounds";
import { CharacterModel } from "./CharacterModel";

export class Insomniac extends CharacterModel {
	name = Character.INSOMNIAC;
	description = "You will view your own role.";
	image =
		"https://cf.geekdo-images.com/imagepage/img/RHfz10FGfiYxunbUsJt1_xNwrS4=/fit-in/900x600/filters:no_upscale()/pic4462588.png";

	nightAction = true;

	async handleNightAction(
		players: Player[],
		centerCards: Character[],
		roleDelay: number,
		playSound: (character: Character, sound: Sound) => Promise<void>,
		createEmbed: (options: Discord.MessageEmbedOptions) => Discord.MessageEmbed
	) {
		await super.handleNightAction(
			players,
			centerCards,
			roleDelay,
			playSound,
			createEmbed
		);

		if (characters.get(Character.DOPPELGANGER)!.amount <= 0) return;

		const doppelganger = players.find(
			player => player.role === Character.DOPPELGANGER
		)! as Player<Character.DOPPELGANGER>;

		await playSound(this.name, Sound.DOPPELGANGER);

		if (doppelganger?.action?.role?.character === Character.INSOMNIAC) {
			this.privateMessage = await doppelganger.member.send(
				createEmbed(this.nightActionDM(doppelganger))
			);
		}

		await delay(roleDelay);

		await this.privateMessage?.delete();

		delete this.nightActionDM;

		await playSound(Character.DOPPELGANGER, Sound.CLOSE);
	}

	nightActionDM(player: Player): Discord.MessageEmbedOptions {
		return {
			...this.nightActionCommon(),
			title: `${this.nightActionTitleRole(player)}, this is your role:`,
			description: capitalize(player.currentRole),
			image: {
				url: characters.get(player.currentRole)!.image,
			},
		};
	}
}
