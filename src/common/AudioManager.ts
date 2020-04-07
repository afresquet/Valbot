import Discord from "discord.js";
import { Readable } from "stream";
import { clamp } from "../helpers/clamp";
import { ErrorOnChat } from "../helpers/ErrorOnChat";
import { Queue } from "../helpers/Queue";
import { State } from "../helpers/State";

export class AudioManager {
	protected voiceChannel: Discord.VoiceChannel | null = null;
	protected connection: Discord.VoiceConnection | null = null;
	protected dispatcher: Discord.StreamDispatcher | null = null;

	protected streamOptions = new State<Discord.StreamOptions>({
		volume: 100,
	});

	protected queue = new Queue<string>([]);

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

	protected async join() {
		if (!this.voiceChannel) {
			throw new Error(
				"Audio Manager is not set to a voice channel, can't join."
			);
		}

		this.connection = await this.voiceChannel.join();

		this.connection.on("disconnect", this.wipe.bind(this));
	}

	protected leave() {
		if (!this.voiceChannel) {
			throw new Error(
				"Audio Manager is not set to a voice channel, can't leave."
			);
		}

		this.voiceChannel.leave();

		this.wipe();
	}

	protected wipe() {
		this.connection = null;

		this.dispatcher = null;

		this.queue.clear();
	}

	protected play(
		input: string | Readable | Discord.VoiceBroadcast,
		options: Discord.StreamOptions = this.streamOptions.current
	) {
		if (!this.voiceChannel) {
			throw new Error(
				"Audio Manager is not set to a voice channel, can't play."
			);
		}

		if (!this.connection) {
			throw new Error(
				`Can't play if not connected to voice channel #${this.voiceChannel.name}.`
			);
		}

		this.dispatcher = this.connection.play(input, options);

		this.dispatcher.on("finish", this.dispatcherOnFinish.bind(this));
	}

	protected dispatcherOnFinish() {
		this.dispatcher?.destroy();

		this.dispatcher = null;

		this.dequeue();
	}

	async enqueue(url: string) {
		this.queue.enqueue(url);

		if (!this.connection) {
			await this.join();

			this.dequeue();
		}

		return this.queue.current.length + 1;
	}

	protected dequeue() {
		if (this.queue.isEmpty) {
			this.leave();

			return;
		}

		const url = this.queue.dequeue();

		this.play(url);
	}

	resume() {
		if (!this.dispatcher) {
			throw new ErrorOnChat("there's nothing to play.");
		}

		this.dispatcher.resume();
	}

	pause() {
		if (!this.dispatcher) {
			throw new ErrorOnChat("there's nothing to pause.");
		}

		this.dispatcher.pause();
	}

	skip() {
		if (!this.dispatcher) {
			throw new ErrorOnChat("there's nothing to skip.");
		}

		this.dispatcherOnFinish();
	}

	getQueue() {
		return this.queue.current;
	}

	remove(position: number) {
		if (Number.isNaN(position)) {
			throw new ErrorOnChat(`position "${position}" is not a valid number.`);
		}

		if (this.queue.current.length < position) {
			throw new ErrorOnChat(`there's nothing at position #${position}.`);
		}

		this.queue.remove(position - 1);
	}

	clearQueue() {
		this.queue.clear();

		this.leave();
	}

	volume(volume?: number) {
		if (volume === undefined) {
			return this.streamOptions.current.volume;
		}

		const newVolume = clamp(volume, 0, 200);

		this.streamOptions.set(curr => ({ ...curr, volume: newVolume / 100 }));

		this.dispatcher?.setVolume(newVolume);

		return newVolume;
	}
}
