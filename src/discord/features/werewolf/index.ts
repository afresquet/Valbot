import Discord from "discord.js";
import { prefixChannel } from "../../../helpers/prefixString";
import { messageSplitter } from "../../../twitch/helpers/messageSplitter";
import { DiscordFeature } from "../../../types/Feature";
import { Character, Characters } from "./types";
import { WerewolfManager } from "./WerewolfManager";

export const werewolf: DiscordFeature = discord => {
	const gameManager = new WerewolfManager();

	discord.on("message", async message => {
		if (message.author.bot) return;

		if (
			(message.channel as Discord.TextChannel).name !==
			prefixChannel("werewolf")
		)
			return;

		if (!gameManager.isReady()) {
			const voiceChannelName = prefixChannel("vc-werewolf");

			const voiceChannel = message.guild?.channels.cache.find(
				c => c.name === voiceChannelName
			) as Discord.VoiceChannel;

			if (!voiceChannel) {
				throw new Error(`There's no #${voiceChannelName} voice channel!`);
			}

			gameManager.setup(message.channel as Discord.TextChannel, voiceChannel);
		}

		const [command, value] = messageSplitter(message.content, 1);

		await message.delete();

		switch (command) {
			case "!join": {
				await gameManager.join(message.member!);

				break;
			}
			case "!rules": {
				const role = value.toLowerCase();

				if (!Characters.includes(role as any)) break;

				await gameManager.rules(role as Character);

				break;
			}
			case "!leave": {
				gameManager.leave(message.author.id);

				break;
			}
			default:
				break;
		}
	});
};
