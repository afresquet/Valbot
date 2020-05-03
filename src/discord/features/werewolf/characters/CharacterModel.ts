import Discord from "discord.js";
import { capitalize } from "../../../../helpers/capitalize";
import { clamp } from "../../../../helpers/clamp";
import { delay } from "../../../../helpers/delay";
import { Character } from "../Character";
import { numberEmojis } from "../emojis";
import { Player } from "../Player";
import { Sound } from "../Sounds";

export abstract class CharacterModel {
	abstract name: Character;
	abstract description: string;
	abstract image: string;

	amount = 0;
	protected maxAmount = 1;

	emoji?: Discord.GuildEmoji;

	abstract nightAction: boolean;
	protected privateMessage?: Discord.Message;
	protected playerReactionsDM = false;
	protected centerCardReactionsDM = false;

	manageAmount(value: number) {
		this.amount = clamp(this.amount + value, 0, this.maxAmount);
	}

	async handleNightAction(
		players: Player[],
		centerCards: Character[],
		roleDelay: number,
		playSound: (character: Character, sound: Sound) => Promise<void>,
		createEmbed: (options: Discord.MessageEmbedOptions) => Discord.MessageEmbed
	) {
		if (this.amount <= 0) return;

		const player = players.find(p => p.role === this.name);

		await playSound(this.name, Sound.WAKE);

		this.privateMessage = await player?.member.send(
			createEmbed(this.nightActionDM(player, players, centerCards))
		);

		if (this.playerReactionsDM) {
			for (let i = 0; i < players.length; i++) {
				if (player?.member.id === players[i].member.id) continue;

				await this.privateMessage?.react(numberEmojis[i]);
			}
		}

		if (this.centerCardReactionsDM) {
			for (let i = 0; i < centerCards.length; i++) {
				await this.privateMessage?.react(centerCards[i]);
			}
		}

		await delay(roleDelay);

		await this.privateMessage?.delete();

		delete this.privateMessage;

		await playSound(this.name, Sound.CLOSE);
	}

	nightActionDM(
		_player: Player,
		_players: Player[],
		_centerCards?: Character[]
	): Discord.MessageEmbedOptions {
		return {};
	}

	protected nightActionTitleRole(player: Player) {
		if (player.role !== Character.DOPPELGANGER) return capitalize(player.role);

		return `Doppelganger-${capitalize(
			(player as Player<Character.DOPPELGANGER>).action.role.character
		)}`;
	}

	protected get nightActionCommon(): Discord.MessageEmbedOptions {
		return {
			description: "React to this message with your choice!",
			footer: { text: "This message will expire soon, act fast!" },
			thumbnail: { url: this.image },
		};
	}

	async handleReaction(
		player: Player,
		_target: Player,
		players: Player[],
		centerCards: Character[],
		_indexes: {
			playerIndex: number;
			centerIndex: number;
		},
		createEmbed: (options: Discord.MessageEmbedOptions) => Discord.MessageEmbed
	) {
		await this.privateMessage?.edit(
			createEmbed(this.nightActionDM(player, players, centerCards))
		);
	}
}
