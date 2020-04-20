import Discord from "discord.js";
import { join } from "path";
import { delay } from "../../../helpers/delay";
import { State } from "../../../helpers/State";
import sounds from "./sounds.json";
import {
	Character,
	Characters,
	GameState,
	NightActionCharacter,
	numberEmojis,
	Player,
} from "./types";
import { WerewolfAudioManager } from "./WerewolfAudioManager";

export class WerewolfManager {
	private textChannel: Discord.TextChannel | null = null;
	private audioManager = new WerewolfAudioManager();

	private players = new State<Player[]>([]);

	private gameState = new State<GameState>("NOT_PLAYING");
	private gameMessage: Discord.Message | null = null;

	private expert = new State(false);

	private gameTimer = new State(300);
	private roleTimer = new State(10);

	private characters = new State<{ character: Character; amount: number }[]>(
		Characters.map(character => ({ character, amount: 0 }))
	);

	private soundPath(sound: string) {
		return join(__dirname, `../../../../assets/werewolf/sounds/${sound}.mp3`);
	}

	isReady() {
		return this.textChannel !== null && this.audioManager.isReady();
	}

	isPlaying() {
		return (
			this.gameState.current !== "NOT_PLAYING" &&
			this.gameState.current !== "PREPARATION"
		);
	}

	isMaster(id: string) {
		return !!this.players.current.find(p => p.member.id === id)?.master;
	}

	setup(textChannel: Discord.TextChannel, voiceChannel: Discord.VoiceChannel) {
		if (!this.textChannel) {
			this.textChannel = textChannel;
		}

		if (!this.audioManager.isReady()) {
			this.audioManager.setVoiceChannel(voiceChannel);
		}
	}

	async join(member: Discord.GuildMember) {
		const player = {
			member,
			role: null,
			master: false,
		};

		if (this.players.current.length === 0) {
			await this.audioManager.join();

			player.master = true;
		}

		this.players.set(curr => [...curr, player]);

		this.refreshEmbed();
	}

	leave(memberId: string) {
		const player = this.players.current.find(p => p.member.id === memberId);

		if (!player) return;

		this.players.set(curr => curr.filter(p => p.member.id !== memberId));

		if (this.players.current.length <= 0) {
			this.audioManager.leave();
		} else if (player.master) {
			this.randomMaster();
		}

		this.refreshEmbed();
	}

	async newGame() {
		if (!this.textChannel) return;

		if (this.gameState.current !== "NOT_PLAYING") return;

		this.gameMessage = await this.textChannel.send(this.preGameEmbed());

		this.gameState.set(() => "PREPARATION");
	}

	manageCharacter(character: Character, add: boolean) {
		this.characters.set(curr =>
			curr.map(c => {
				let amount = c.amount + 1;

				if (!add) {
					amount = c.amount - 1 < 0 ? 0 : c.amount - 1;
				}

				return c.character === character ? { ...c, amount } : c;
			})
		);

		this.refreshEmbed();
	}

	async start() {
		this.gameState.set(() => "NIGHT");

		await this.muteAll(true);

		await this.audioManager.play(this.soundPath(sounds.everyone.close));

		await this.playCharacter("werewolf");

		await this.playCharacter("minion");

		await this.playCharacter("mason");

		await this.playCharacter("seer");

		await this.playCharacter("robber");

		await this.playCharacter("troublemaker");

		await this.playCharacter("drunk");

		await this.playCharacter("insomniac");

		await delay(2000);

		await this.audioManager.play(this.soundPath(sounds.everyone.wake));

		this.muteAll(false);

		this.gameState.set(() => "DAY");

		this.finish();
	}

	finish() {
		this.gameState.set(() => "VOTING");

		this.gameState.set(() => "NOT_PLAYING");

		this.gameMessage = null;
	}

	async rules(character: Character) {
		await this.audioManager.play(this.soundPath(sounds[character].name));
		await this.audioManager.play(this.soundPath(sounds[character].rules));
	}

	private async muteAll(on: boolean) {
		await this.audioManager.muteAll(on);
	}

	setMaster(memberId: string) {
		if (!this.players.current.find(p => p.member.id === memberId)) return;

		this.players.set(curr =>
			curr.map(p => ({ ...p, master: p.member.id === memberId }))
		);

		this.refreshEmbed();
	}

	randomMaster() {
		const randomIndex = Math.floor(Math.random() * this.players.current.length);

		this.players.set(curr =>
			curr.map((player, index) =>
				index === randomIndex ? { ...player, master: true } : player
			)
		);
	}

	toggleExpert() {
		this.expert.set(curr => !curr);

		this.refreshEmbed();
	}

	changeTimer(timer: "game" | "role", seconds: number) {
		if (timer === "game") {
			this.gameTimer.set(() => (seconds > 0 ? seconds : 0));
		} else if (timer === "role") {
			this.roleTimer.set(() => (seconds > 0 ? seconds : 0));
		}

		this.refreshEmbed();
	}

	changeVolume(volume: number) {
		this.audioManager.setVolume(volume);

		this.refreshEmbed();
	}

	private async playCharacter(character: NightActionCharacter) {
		if (
			this.characters.current.find(c => c.character === character)!.amount <= 0
		)
			return;

		if (this.expert.current) {
			await this.audioManager.play(
				this.soundPath(sounds[character].expert.wake)
			);
		} else {
			await this.audioManager.play(this.soundPath(sounds[character].wake));
		}

		await delay(this.roleTimer.current * 1000);

		if (character === "minion") {
			await this.audioManager.play(this.soundPath(sounds.minion.thumb));
		}

		await this.audioManager.play(this.soundPath(sounds[character].close));
	}

	private refreshEmbed() {
		if (!this.gameMessage || this.gameState.current === "NOT_PLAYING") return;

		if (this.gameState.current === "PREPARATION") {
			this.gameMessage.edit(this.preGameEmbed());
		}
	}

	preGameEmbed() {
		return new Discord.MessageEmbed({
			author: {
				name: "One Night Ultimate Werewolf",
				icon_url:
					"https://image.winudf.com/v2/image1/Y29tLm1vYmllb3Mua2FyYW4uV29sZl9BbmRyb2lkMTRfMTFfMTNfaWNvbl8xNTU2NjQ4NDY4XzA0NA/icon.png?w=340&fakeurl=1",
			},
			footer: {
				text: `Volume: ${100 * <number>this.audioManager.getOption("volume")}%`,
			},
			fields: [
				{
					name: "Players",
					value: this.players.current.reduce((result, player, index) => {
						const playerLine = `${numberEmojis[index]} ${
							player.member.displayName
						} ${player.master ? "(Master)" : ""}`;

						return index === 0 ? playerLine : `${result}\n${playerLine}`;
					}, "No players have joined yet."),
				},
				{
					name: "Characters",
					value: this.characters.current.reduce((result, character) => {
						const characterName =
							character.character.charAt(0).toUpperCase() +
							character.character.substring(1);

						const nextLine =
							result === "No characters have been set yet."
								? `${characterName}: ${character.amount}`
								: `${result}\n${characterName}: ${character.amount}`;

						return character.amount > 0 ? nextLine : result;
					}, "No characters have been set yet."),
				},
				{
					name: "Game Timer",
					value: `${this.gameTimer.current} seconds`,
					inline: true,
				},
				{
					name: "Role Timer",
					value: `${this.roleTimer.current} seconds`,
					inline: true,
				},
				{
					name: "Expert Mode",
					value: this.expert.current ? "On" : "Off",
					inline: true,
				},
			],
		});
	}
}
