import Discord from "discord.js";
import { prefixChannel } from "../../../helpers/prefixString";
import { messageSplitter } from "../../../twitch/helpers/messageSplitter";
import { DiscordFeature } from "../../../types/Feature";
import sounds from "./sounds.json";
import { WerewolfManager } from "./WerewolfManager";

const characters = Object.entries(sounds)
	.filter(([_, value]) => value.hasOwnProperty("rules"))
	.map(([key]) => key);

export const werewolf: DiscordFeature = discord => {
	const gameManager = new WerewolfManager();

	discord.on("message", async message => {
		if (message.author.bot) return;

		if (
			(message.channel as Discord.TextChannel).name !==
			prefixChannel("werewolf")
		)
			return;

		if (!gameManager.audioManager.isReady()) {
			const voiceChannelName = prefixChannel("vc-werewolf");

			const voiceChannel = message.guild?.channels.cache.find(
				c => c.name === voiceChannelName
			) as Discord.VoiceChannel;

			if (!voiceChannel) {
				throw new Error(`There's no #${voiceChannelName} voice channel!`);
			}

			gameManager.audioManager.setVoiceChannel(voiceChannel);
		}

		const [command, value] = messageSplitter(message.content, 1);

		switch (command) {
			case "!join": {
				await gameManager.join();

				break;
			}
			case "!rules": {
				if (!characters.includes(value)) break;

				await gameManager.rules(value as any);

				break;
			}
			default:
				break;
		}
	});
};
