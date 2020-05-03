import Discord from "discord.js";
import { join } from "path";
import { Readable } from "stream";
import { AudioManager } from "../../../helpers/AudioManager";
import { ErrorOnChat } from "../../../helpers/ErrorOnChat";
import { Character } from "./Character";
import { Sound } from "./Sounds";

export class WerewolfAudioManager extends AudioManager {
	private language = "en";
	private voice = "male";
	expert = false;

	play(
		input: string | Readable | Discord.VoiceBroadcast,
		options: Discord.StreamOptions = this.streamOptions
	): Promise<void> {
		return new Promise((resolve, reject) => {
			if (!this.voiceChannel) {
				reject(
					new Error("Audio Manager is not set to a voice channel, can't play.")
				);

				return;
			}

			if (!this.connection) {
				reject(
					new ErrorOnChat(`need to join #${this.voiceChannel.name} first.`)
				);

				return;
			}

			this.dispatcher = this.connection.play(input, options);

			this.dispatcher.on("finish", () => {
				this.dispatcher?.destroy();

				this.dispatcher = null;

				resolve();
			});
		});
	}

	async playSound(character: Character | "everyone", sound: Sound) {
		const values = [this.language, this.voice];

		if (
			this.expert &&
			[Sound.WAKE, Sound.DOPPELGANGER].includes(sound) &&
			character !== "everyone"
		) {
			values.push("expert");
		}

		values.push(character, sound);

		const fileName = values.join("_");

		await this.play(
			join(__dirname, `../../../../assets/werewolf/sounds/${fileName}.mp3`)
		);
	}

	muteAll(on: boolean) {
		if (!this.voiceChannel) return;

		return Promise.all(
			this.voiceChannel.members.map(member =>
				member.user.bot ? member.voice.setMute(false) : member.voice.setMute(on)
			)
		);
	}

	toggleExpert() {
		this.expert = !this.expert;
	}
}
