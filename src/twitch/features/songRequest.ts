import Discord from "discord.js";
import { songRequestManager } from "../../common/songRequestManager";
import { prefixChannel, prefixCommand } from "../../helpers/prefixString";
import { YoutubeAudioManager } from "../../helpers/YoutubeAudioManager";
import { TwitchFeature } from "../../types/Feature";
import { isMod } from "../helpers/isMod";
import { messageSplitter } from "../helpers/messageSplitter";

export const songRequest: TwitchFeature = (twitch, discord) => {
	twitch.on("message", async (channel, userstate, message, self) => {
		if (self) return;

		if (!message.startsWith("!")) return;

		const [command, action, value] = messageSplitter(message, 2);

		if (command !== prefixCommand("sr")) return;

		if (!songRequestManager.isReady()) {
			const voiceChannelName = prefixChannel("vibin");

			const voiceChannel = discord.guilds.cache
				.first()
				?.channels.cache.find(
					c => c.name === voiceChannelName
				) as Discord.VoiceChannel;

			if (!voiceChannel) {
				throw new Error(`There's no #${voiceChannelName} voice channel!`);
			}

			songRequestManager.setVoiceChannel(voiceChannel);
		}

		if (YoutubeAudioManager.youtubeUrlRegex.test(action)) {
			const position = await songRequestManager.enqueue(action);

			await twitch.say(
				channel,
				`@${userstate.username}, song was added at position #${position}.`
			);
		} else if (!isMod(channel, userstate)) {
			await twitch.say(
				channel,
				`@${userstate.username}, the provided URL is not from YouTube.`
			);

			return;
		}

		try {
			switch (action) {
				case "play": {
					songRequestManager.resume();

					break;
				}

				case "pause": {
					songRequestManager.pause();

					break;
				}

				case "skip": {
					songRequestManager.skip();

					break;
				}

				case "remove": {
					const position = parseInt(value, 10);

					songRequestManager.remove(position);

					await twitch.say(
						channel,
						`@${userstate.username}, song at position #${position} was removed from the queue.`
					);

					break;
				}

				case "clear": {
					songRequestManager.clearQueue();

					await twitch.say(
						channel,
						`@${userstate.username}, song queue was cleared.`
					);

					break;
				}

				case "volume": {
					if (value === "") {
						const volume = songRequestManager.volume();

						await twitch.say(
							channel,
							`@${userstate.username}, current volume is ${volume}%.`
						);

						break;
					}

					const volume = parseInt(value, 10);

					if (Number.isNaN(volume)) {
						twitch.say(
							channel,
							`@${userstate.username}, volume "${value}" is not a valid number.`
						);

						return;
					}

					const newVolume = songRequestManager.volume(volume);

					await twitch.say(
						channel,
						`@${userstate.username}, volume was set to ${newVolume}%.`
					);

					break;
				}

				case "help": {
					await twitch.say(
						channel,
						`@${userstate.username}, ${command} <youtubeURL>; ${command} <action> <value> - (Mod only) Available actions are "play", "pause", "skip", "remove", "clear", "volume".`
					);

					break;
				}

				default: {
					await twitch.say(
						channel,
						`@${userstate.username}, invalid action, use "${command} help"`
					);

					break;
				}
			}
		} catch (error) {
			if (!error.chat) throw error;

			await twitch.say(channel, `@${userstate.username}, ${error.message}`);
		}
	});
};
