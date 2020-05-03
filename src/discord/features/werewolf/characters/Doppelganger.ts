import Discord from "discord.js";
import { characters } from ".";
import { delay } from "../../../../helpers/delay";
import { Character } from "../Character";
import { centerEmojis, numberEmojis } from "../emojis";
import { findPlayerById } from "../helpers/findPlayerById";
import { listOfEveryone } from "../helpers/listOfEveryone";
import { Player } from "../Player";
import { Sound } from "../Sounds";
import { CharacterModel } from "./CharacterModel";

export class Doppelganger extends CharacterModel {
	name = Character.DOPPELGANGER;
	description =
		"You will look at any other player's card and will become that role yourself, in addition to the player with that role.";
	image =
		"https://cf.geekdo-images.com/imagepage/img/rP3xvC-HFqIonPj5mmr6_1lJYJ8=/fit-in/900x600/filters:no_upscale()/pic4462582.png";

	nightAction = true;
	protected playerReactionsDM = true;

	async handleNightAction(
		players: Player[],
		centerCards: Character[],
		roleDelay: number,
		playSound: (character: Character, sound: Sound) => Promise<void>,
		createEmbed: (options: Discord.MessageEmbedOptions) => Discord.MessageEmbed
	) {
		if (this.amount <= 0) return;

		const doppelganger = players.find(
			player => player.role === this.name
		) as Player<Character.DOPPELGANGER>;

		await playSound(this.name, Sound.WAKE);

		this.privateMessage = await doppelganger?.member.send(
			createEmbed(this.nightActionDM(doppelganger, players))
		);

		if (this.playerReactionsDM) {
			for (let i = 0; i < players.length; i++) {
				if (doppelganger?.member.id === players[i].member.id) continue;

				await this.privateMessage?.react(numberEmojis[i]);
			}
		}

		await delay(roleDelay);

		await this.privateMessage?.delete();

		delete this.privateMessage;

		if (doppelganger?.action) {
			doppelganger.action.ready = true;
		}

		const copiedRole = characters.get(doppelganger?.action?.role?.character);

		if (
			[
				Character.SEER,
				Character.ROBBER,
				Character.TROUBLEMAKER,
				Character.DRUNK,
			].includes(doppelganger?.action?.role?.character)
		) {
			this.privateMessage = await doppelganger?.member.send(
				createEmbed(
					copiedRole!.nightActionDM(doppelganger, players, centerCards)
				)
			);
		}

		if (
			[Character.SEER, Character.ROBBER, Character.TROUBLEMAKER].includes(
				doppelganger?.action?.role?.character
			)
		) {
			for (let i = 0; i < players.length; i++) {
				if (doppelganger?.member.id === players[i].member.id) continue;

				await this.privateMessage?.react(numberEmojis[i]);
			}
		}

		if (
			[Character.SEER, Character.DRUNK].includes(
				doppelganger?.action?.role?.character
			)
		) {
			for (let i = 0; i < centerEmojis.length; i++) {
				await this.privateMessage?.react(centerEmojis[i]);
			}
		}

		await delay(roleDelay);

		await this.privateMessage?.delete();

		delete this.privateMessage;

		const minion = characters.get(Character.MINION)!;

		if (minion.amount > 0) {
			await playSound(Character.MINION, Sound.DOPPELGANGER);

			if (doppelganger?.action?.role?.character === Character.MINION) {
				this.privateMessage = await doppelganger.member.send(
					createEmbed(minion.nightActionDM(doppelganger, players))
				);
			}

			await delay(roleDelay);

			await this.privateMessage?.delete();

			delete this.privateMessage;
		}

		await playSound(this.name, Sound.CLOSE);
	}

	nightActionDM(
		player: Player,
		players: Player[]
	): Discord.MessageEmbedOptions {
		const doppelganger = player as Player<Character.DOPPELGANGER>;

		if (doppelganger.action) {
			const target = findPlayerById(players, doppelganger.action.player)!;

			const hasAction = [
				Character.MINION,
				Character.SEER,
				Character.ROBBER,
				Character.TROUBLEMAKER,
				Character.DRUNK,
			].includes(doppelganger.action.role.character);

			return {
				...this.nightActionCommon,
				title: `Doppelganger, you copied the role from ${target.member.displayName}:`,
				description: `You became a ${doppelganger.action.role.character}! ${
					hasAction ? "Your action will show up right after this message." : ""
				}`,
				image: {
					url: characters.get(doppelganger.action.role.character)!.image,
				},
			};
		}

		return {
			...this.nightActionCommon,
			title: "Doppelganger, choose a player to become their role.",
			description: listOfEveryone(players, [doppelganger.member.id]),
		};
	}

	async handleReaction(
		player: Player,
		target: Player,
		_players: Player[],
		_centerCards: Character[],
		indexes: {
			playerIndex: number;
			centerIndex: number;
		}
	) {
		const doppelganger = player as Player<Character.DOPPELGANGER>;

		if (!doppelganger.action.ready) {
			if (indexes.playerIndex === -1 || doppelganger.action) return;

			doppelganger.action = {
				player: target.member.id,
				ready: false,
				role: {
					character: target.role,
					action: undefined,
				},
			};

			return;
		}
	}
}
