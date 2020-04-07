import Discord from "discord.js";
import ytdl from "ytdl-core";
import { AudioManager } from ".";
import { ErrorOnChat } from "../ErrorOnChat";

export class YoutubeAudioManager extends AudioManager {
	static youtubeUrlRegex = /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/;

	protected play(
		url: string,
		options: Discord.StreamOptions = this.streamOptions.current
	) {
		super.play(
			ytdl(url, { filter: "audioonly", quality: "highestaudio" }),
			options
		);
	}

	enqueue(url: string) {
		if (!YoutubeAudioManager.youtubeUrlRegex.test(url)) {
			throw new ErrorOnChat("that's not a valid YouTube URL!");
		}

		return super.enqueue(url);
	}
}
