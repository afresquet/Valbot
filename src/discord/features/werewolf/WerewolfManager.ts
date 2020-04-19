import Discord from "discord.js";
import { join } from "path";
import { State } from "../../../helpers/State";
import sounds from "./sounds.json";
import { Character, Player } from "./types";
import { WerewolfAudioManager } from "./WerewolfAudioManager";

export class WerewolfManager {
	audioManager = new WerewolfAudioManager();

	private players = new State<Player[]>([]);

	private soundPath(sound: string) {
		return join(__dirname, `../../../../assets/werewolf/sounds/${sound}.mp3`);
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
}
