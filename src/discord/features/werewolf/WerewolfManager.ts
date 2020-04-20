import Discord from "discord.js";
import { join } from "path";
import { clamp } from "../../../helpers/clamp";
import { delay } from "../../../helpers/delay";
import { prefixChannel, prefixRole } from "../../../helpers/prefixString";
import { State } from "../../../helpers/State";
import sounds from "./sounds.json";
import {
	Character,
	Characters,
	GameState,
	NightActionCharacter,
	NightActionCharacters,
	numberEmojis,
	Player,
} from "./types";
import { WerewolfAudioManager } from "./WerewolfAudioManager";

export class WerewolfManager {
	private textChannel: Discord.TextChannel | null = null;
	private audioManager = new WerewolfAudioManager();
	private playerRole: Discord.Role | null = null;

	private players = new State<Player[]>([]);
	private centerCards = new State<Character[]>([]);

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

	setup(guild: Discord.Guild) {
		if (!this.textChannel) {
			const textChannelName = prefixChannel("werewolf");

			const textChannel = guild.channels.cache.find(
				c => c.name === textChannelName
			) as Discord.TextChannel;

			if (!textChannel) {
				throw new Error(`There's no #${textChannelName} text channel!`);
			}

			this.textChannel = textChannel;
		}

		if (!this.audioManager.isReady()) {
			const voiceChannelName = prefixChannel("vc-werewolf");

			const voiceChannel = guild.channels.cache.find(
				c => c.name === voiceChannelName
			) as Discord.VoiceChannel;

			if (!voiceChannel) {
				throw new Error(`There's no #${voiceChannelName} voice channel!`);
			}

			this.audioManager.setVoiceChannel(voiceChannel);
		}

		if (!this.playerRole) {
			const playerRoleName = prefixRole("werewolf player");

			const playerRole = guild.roles.cache.find(r => r.name === playerRoleName);

			if (!playerRole) {
				throw new Error(`There's no #${playerRoleName} role!`);
			}

			this.playerRole = playerRole;
		}
	}

	async join(member: Discord.GuildMember) {
		if (this.players.current.find(p => p.member.id === member.id)) return;

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

		member.roles.add(this.playerRole!);

		this.refreshEmbed();
	}

	leave(memberId: string) {
		const player = this.players.current.find(p => p.member.id === memberId);

		if (!player) return;

		this.players.set(curr => curr.filter(p => p.member.id !== memberId));

		player.member.roles.remove(this.playerRole!);

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

		this.gameMessage = await this.textChannel.send(this.preparationEmbed());

		this.gameState.set(() => "PREPARATION");
	}

	manageCharacter(character: Character, add: boolean) {
		this.characters.set(curr =>
			curr.map(c =>
				c.character === character
					? { ...c, amount: clamp(c.amount + (add ? 1 : -1), 0, 3) }
					: c
			)
		);

		this.refreshEmbed();
	}

	async start() {
		if (this.gameState.current !== "PREPARATION") return;

		const charactersAmount = this.characters.current.reduce(
			(result, current) => result + current.amount,
			0
		);
		const playersAmount = this.players.current.length + 3;

		if (charactersAmount !== playersAmount) return;

		this.assignRoles();

		await this.night();

		await this.day();

		await this.voting();

		this.finish();
	}

	assignRoles() {
		this.gameState.set(() => "ROLE_ASSIGNING");

		const roles = this.characters.current.reduce<Character[]>(
			(result, current) => [
				...result,
				...new Array(current.amount).fill(current.character),
			],
			[]
		);

		this.players.set(curr =>
			curr.map(player => ({
				...player,
				role: roles.splice(Math.floor(Math.random() * roles.length), 1)[0],
			}))
		);

		this.centerCards.set(() => roles);
	}

	async night() {
		this.gameState.set(() => "NIGHT");

		this.refreshEmbed();

		await Promise.all([
			this.audioManager.play(this.soundPath(sounds.everyone.close)),
			this.muteAll(true),
		]);

		for (const character of NightActionCharacters) {
			await this.playCharacter(character);
		}

		await delay(2000);
	}

	async day() {
		this.gameState.set(() => "DAY");

		await Promise.all([
			this.audioManager.play(this.soundPath(sounds.everyone.wake)),
			this.muteAll(false),
		]);

		await delay(this.gameTimer.current * 1000);
	}

	async voting() {
		this.gameState.set(() => "VOTING");

		await this.audioManager.play(this.soundPath(sounds.everyone.timeisup));

		await delay(this.roleTimer.current * 1000);
	}

	finish() {
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
		if (!this.gameMessage) return;

		switch (this.gameState.current) {
			case "PREPARATION":
				this.gameMessage.edit(this.preparationEmbed());
				break;
			case "NIGHT":
				this.gameMessage.edit(this.nightEmbed());
				break;
			case "NOT_PLAYING":
			default:
				break;
		}
	}

	baseEmbed(options: Discord.MessageEmbedOptions) {
		return new Discord.MessageEmbed({
			author: {
				name: "One Night Ultimate Werewolf",
				icon_url:
					"https://image.winudf.com/v2/image1/Y29tLm1vYmllb3Mua2FyYW4uV29sZl9BbmRyb2lkMTRfMTFfMTNfaWNvbl8xNTU2NjQ4NDY4XzA0NA/icon.png?w=340&fakeurl=1",
			},
			footer: {
				text: `Volume: ${100 * <number>this.audioManager.getOption("volume")}%`,
			},
			...options,
		});
	}

	preparationEmbed() {
		return this.baseEmbed({
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

	nightEmbed() {
		return this.baseEmbed({
			title: "schleeeeeeeepy time",
			image: {
				url:
					"https://www.petmd.com/sites/default/files/shutterstock_395310793.jpg",
			},
		});
	}
}
