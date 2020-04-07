import Discord from "discord.js";
import ytdl from "ytdl-core";
import { ErrorOnChat } from "../helpers/ErrorOnChat";
import { AudioManager } from "./AudioManager";

export class SongRequestManager extends AudioManager {
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
		if (!SongRequestManager.youtubeUrlRegex.test(url)) {
			throw new ErrorOnChat("that's not a valid YouTube URL!");
		}

		return super.enqueue(url);
	}
}

export const songRequestManager = new SongRequestManager();
