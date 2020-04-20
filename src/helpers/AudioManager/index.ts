import Discord from "discord.js";
import { Readable } from "stream";
import { clamp } from "../clamp";
import { ErrorOnChat } from "../ErrorOnChat";
import { State } from "../State";

export class AudioManager {
	protected voiceChannel: Discord.VoiceChannel | null = null;
	protected connection: Discord.VoiceConnection | null = null;
	protected dispatcher: Discord.StreamDispatcher | null = null;

	protected streamOptions = new State<Discord.StreamOptions>({
		volume: 1,
	});

	setVoiceChannel(voiceChannel: Discord.VoiceChannel) {
		if (!this.voiceChannel) {
			this.voiceChannel = voiceChannel;
		} else if (this.voiceChannel.id !== voiceChannel.id) {
			throw new Error(
				`Trying to set Audio Manager to channel #${voiceChannel.name} when it's already set to #${this.voiceChannel.name}.`
			);
		}
	}

	isReady() {
		return this.voiceChannel !== null;
	}

	async join() {
		if (!this.voiceChannel) {
			throw new Error(
				"Audio Manager is not set to a voice channel, can't join."
			);
		} else if (this.connection !== null) {
			throw new ErrorOnChat("already connected.");
		}

		this.connection = await this.voiceChannel.join();

		this.connection.on("disconnect", this.cleanUp.bind(this));
	}

	leave() {
		if (!this.voiceChannel) {
			throw new Error(
				"Audio Manager is not set to a voice channel, can't leave."
			);
		}

		this.voiceChannel.leave();
	}

	protected cleanUp() {
		this.connection = null;

		this.dispatcher = null;
	}

	play(
		input: string | Readable | Discord.VoiceBroadcast,
		options: Discord.StreamOptions
	) {
		if (!this.voiceChannel) {
			throw new Error(
				"Audio Manager is not set to a voice channel, can't play."
			);
		}

		if (!this.connection) {
			throw new ErrorOnChat(`need to join #${this.voiceChannel.name} first.`);
		}

		this.dispatcher = this.connection.play(input, options);

		this.dispatcher.on("finish", this.dispatcherOnFinish.bind(this));
	}

	protected dispatcherOnFinish() {
		this.dispatcher?.destroy();

		this.dispatcher = null;
	}

	resume() {
		if (!this.dispatcher || !this.dispatcher.paused) {
			throw new ErrorOnChat("there's nothing to resume");
		}

		this.dispatcher.resume();
	}

	pause() {
		if (!this.dispatcher) {
			throw new ErrorOnChat("there's nothing to pause.");
		}

		this.dispatcher.pause();
	}

	getOption<T extends keyof Discord.StreamOptions>(
		option: T
	): Discord.StreamOptions[T] {
		return this.streamOptions.current[option];
	}

	protected setOption<T extends keyof Discord.StreamOptions>(
		option: T,
		value: Discord.StreamOptions[T]
	) {
		switch (option) {
			case "bitrate": {
				this.dispatcher?.setBitrate(value as number | "auto");
				break;
			}
			case "fec": {
				this.dispatcher?.setFEC(value as boolean);
				break;
			}
			case "plp": {
				this.dispatcher?.setPLP(value as number);
				break;
			}
			case "volume": {
				this.dispatcher?.setVolume(value as number);
				break;
			}
			default: {
				break;
			}
		}

		this.streamOptions.set(curr => ({ ...curr, [option]: value }));
	}

	setVolume(volume: number) {
		const newVolume = clamp(volume, 0, 200) / 100;

		this.setOption("volume", newVolume);
	}
}
