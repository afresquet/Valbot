import Discord from "discord.js";
import { join } from "path";
import { State } from "../../../helpers/State";
import sounds from "./sounds.json";
import { Character, Player } from "./types";
import { WerewolfAudioManager } from "./WerewolfAudioManager";

export class WerewolfManager {
	private textChannel: Discord.TextChannel | null = null;
	private audioManager = new WerewolfAudioManager();

	private players = new State<Player[]>([]);

	private active = new State(false);

	private expert = new State(false);

	private gameTimer = new State(300);
	private roleTimer = new State(10);

	private soundPath(sound: string) {
		return join(__dirname, `../../../../assets/werewolf/sounds/${sound}.mp3`);
	}

	isReady() {
		return this.textChannel !== null && this.audioManager.isReady();
	}

	isActive() {
		return this.active.current;
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
	}

	start() {
		this.active.set(() => true);
	}

	finish() {
		this.active.set(() => false);
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
	}

	changeTimer(timer: "game" | "role", seconds: number) {
		if (timer === "game") {
			this.gameTimer.set(() => (seconds > 0 ? seconds : 0));
		} else if (timer === "role") {
			this.roleTimer.set(() => (seconds > 0 ? seconds : 0));
		}
	}
}
