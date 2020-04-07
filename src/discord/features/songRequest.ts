import Discord from "discord.js";
import { songRequestManager } from "../../common/SongRequestManager";
import { prefixChannel } from "../../helpers/prefixString";
import { messageSplitter } from "../../twitch/helpers/messageSplitter";
import { DiscordFeature } from "../../types/Feature";

export const songRequest: DiscordFeature = discord => {
	discord.on("message", async message => {
		if (message.author.bot) return;

		if (!message.content.startsWith("!")) return;

		const channel = message.channel as Discord.TextChannel;

		if (channel.name !== prefixChannel("vibin-text")) return;

		if (!songRequestManager.isReady()) {
			const voiceChannelName = prefixChannel("vibin");

			const voiceChannel = message.guild?.channels.cache.find(
				c => c.name === voiceChannelName
			) as Discord.VoiceChannel;

			if (!voiceChannel) {
				await message.reply(`there's no #${voiceChannelName} voice channel!`);

				return;
			}

			songRequestManager.setVoiceChannel(voiceChannel);
		}

		const [command, value] = messageSplitter(message.content, 1);

		try {
			switch (command) {
				case "!sr": {
					const position = await songRequestManager.enqueue(value);

					await message.reply(`song was added at position #${position}.`);

					break;
				}

				case "!play": {
					songRequestManager.resume();

					break;
				}

				case "!pause": {
					songRequestManager.pause();

					break;
				}

				case "!skip": {
					songRequestManager.skip();

					break;
				}

				case "!remove": {
					const position = parseInt(value, 10);

					songRequestManager.remove(position);

					await message.reply(
						`song at position #${position} was removed from the queue.`
					);

					break;
				}

				case "!clear": {
					songRequestManager.clearQueue();

					await message.reply("song queue was cleared.");

					break;
				}

				case "!volume": {
					if (value === "") {
						const volume = songRequestManager.volume();

						await message.reply(`current volume is ${volume}%.`);

						break;
					}

					const volume = parseInt(value, 10);

					if (Number.isNaN(volume)) {
						message.reply(`volume "${value}" is not a valid number.`);

						return;
					}

					const newVolume = songRequestManager.volume(volume);

					await message.reply(`volume was set to ${newVolume}%.`);

					break;
				}

				default: {
					await message.reply(`unrecognized command "${command}".`);

					break;
				}
			}
		} catch (error) {
			if (!error.chat) throw error;

			await message.reply(error.message);
		}
	});
};
