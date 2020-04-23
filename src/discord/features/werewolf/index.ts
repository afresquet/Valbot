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

		if (!gameManager.isReady()) gameManager.setup(message.guild!);

		const [command, value] = messageSplitter(message.content, 1);

		await message.delete();

		if (gameManager.isPlaying()) {
			switch (command) {
				case "!cancel": {
					gameManager.cancel();

					break;
				}
				default:
					break;
			}
		} else {
			switch (command) {
				case "!newgame": {
					await gameManager.newGame();

					break;
				}
				case "!start": {
					if (!gameManager.isMaster(message.author.id)) return;

					await gameManager.start();

					break;
				}
				case "!join": {
					await gameManager.join(message.member!);

					break;
				}
				case "!leave": {
					await gameManager.leave(message.author.id);

					break;
				}
				case "!kick": {
					if (!gameManager.isMaster(message.author.id)) return;

					const member = message.mentions.users.first();

					if (!member) break;

					await gameManager.leave(member.id);

					break;
				}
				case "!add":
				case "!remove": {
					const character = value.toLowerCase();

					if (!gameManager.isMaster(message.author.id)) return;

					if (!Characters.includes(character as any)) return;

					await gameManager.manageCharacter(
						character as Character,
						command === "!add"
					);

					break;
				}
				case "!rules": {
					const role = value.toLowerCase();

					if (!Characters.includes(role as any)) break;

					await gameManager.rules(role as Character);

					break;
				}
				case "!master":
				case "!forcemaster": {
					if (command === "!master" && !gameManager.isMaster(message.author.id))
						break;

					if (
						command === "!forcemaster" &&
						(!message.member?.hasPermission("ADMINISTRATOR") ||
							!message.member?.roles.cache.find(role => role.name === "mods"))
					)
						break;

					const member = message.mentions.users.first();

					if (!member) break;

					await gameManager.setMaster(member.id);

					break;
				}
				case "!expert": {
					if (!gameManager.isMaster(message.author.id)) return;

					await gameManager.toggleExpert();

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

					await gameManager.changeTimer(
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

				await gameManager.changeVolume(parseInt(value, 10));

				break;
			}
			default:
				break;
		}
	});

	discord.on("messageReactionAdd", async (reaction, user) => {
		if (user.bot) return;

		if (reaction.message.channel.type !== "dm") return;

		await gameManager.handleReaction(reaction, user as Discord.User);
	});
};
