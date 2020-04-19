import { join } from "path";
import sounds from "./sounds.json";
import { WerewolfAudioManager } from "./WerewolfAudioManager";

export class WerewolfManager {
	audioManager = new WerewolfAudioManager();

	protected soundPath(sound: string) {
		return join(__dirname, `../../../../assets/werewolf/sounds/${sound}.mp3`);
	}

	async join() {
		await this.audioManager.join();
	}

	async rules(character: keyof Omit<typeof sounds, "background" | "everyone">) {
		await this.audioManager.play(this.soundPath(sounds[character].name));
		await this.audioManager.play(this.soundPath(sounds[character].rules));
	}
}
