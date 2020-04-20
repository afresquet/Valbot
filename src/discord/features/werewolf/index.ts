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

		if (gameManager.isActive()) {
			switch (command) {
				case "!cancel": {
					gameManager.finish();

					break;
				}
				default:
					break;
			}
		} else {
			switch (command) {
				case "!start": {
					if (!gameManager.isMaster(message.author.id)) return;

					gameManager.start();

					break;
				}
				case "!join": {
					await gameManager.join(message.member!);

					break;
				}
				case "!leave": {
					gameManager.leave(message.author.id);

					break;
				}
				case "!add":
				case "!remove": {
					if (!gameManager.isMaster(message.author.id)) return;

					if (!Characters.includes(value as any)) return;

					gameManager.manageCharacter(value as Character, command === "!add");

					break;
				}
				case "!rules": {
					const role = value.toLowerCase();

					if (!Characters.includes(role as any)) break;

					await gameManager.rules(role as Character);

					break;
				}
				case "!master": {
					if (!gameManager.isMaster(message.author.id)) return;

					const member = message.mentions.users.first();

					if (!member) break;

					gameManager.setMaster(member.id);

					break;
				}
				case "!expert": {
					if (!gameManager.isMaster(message.author.id)) return;

					gameManager.toggleExpert();

					break;
				}
				case "!timer": {
					if (!gameManager.isMaster(message.author.id)) return;

					const [timer, seconds] = messageSplitter(value, 2);

					if (
						!["game", "role"].includes(timer) ||
						Number.isNaN(parseInt(seconds, 10))
					)
						return;

					gameManager.changeTimer(
						timer as "game" | "role",
						parseInt(seconds, 10)
					);

					break;
				}
				default:
					break;
			}
		}

		switch (command) {
			case "!volume": {
				if (!gameManager.isMaster(message.author.id)) return;

				if (Number.isNaN(parseInt(value, 10))) return;

				gameManager.changeVolume(parseInt(value, 10));

				break;
			}
			default:
				break;
		}
	});
};
