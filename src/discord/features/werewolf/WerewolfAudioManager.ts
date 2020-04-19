import Discord from "discord.js";
import { Readable } from "stream";
import { AudioManager } from "../../../helpers/AudioManager";
import { ErrorOnChat } from "../../../helpers/ErrorOnChat";

export class WerewolfAudioManager extends AudioManager {
	play(
		input: string | Readable | Discord.VoiceBroadcast,
		options: Discord.StreamOptions = this.streamOptions.current
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

	muteAll(on: boolean) {
		if (!this.voiceChannel) return;

		return Promise.all(
			this.voiceChannel.members.map(member =>
				member.user.bot ? member.voice.setMute(false) : member.voice.setMute(on)
			)
		);
	}
}
