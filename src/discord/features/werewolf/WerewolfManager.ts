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

	private soundPath(sound: string) {
		return join(__dirname, `../../../../assets/werewolf/sounds/${sound}.mp3`);
	}

	isReady() {
		return this.textChannel !== null && this.audioManager.isReady();
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
		if (this.players.current.length === 0) {
			await this.audioManager.join();
		}

		this.players.set(curr => [
			...curr,
			{
				member,
				role: null,
			},
		]);
	}

	leave(memberId: string) {
		this.players.set(curr => curr.filter(p => p.member.id !== memberId));

		if (this.players.current.length <= 0) {
			this.audioManager.leave();
		}
	}

	async rules(character: Character) {
		await this.audioManager.play(this.soundPath(sounds[character].name));
		await this.audioManager.play(this.soundPath(sounds[character].rules));
	}

	private async muteAll(on: boolean) {
		await this.audioManager.muteAll(on);
	}
}
