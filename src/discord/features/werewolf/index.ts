import Discord from "discord.js";
import { isProduction } from "../../../helpers/isProduction";
import { prefixChannel } from "../../../helpers/prefixString";
import { messageSplitter } from "../../../twitch/helpers/messageSplitter";
import { DiscordFeature } from "../../../types/Feature";
import { Character } from "./Character";
import { GameState } from "./types";
import { WerewolfManager } from "./WerewolfManager";

export const werewolf: DiscordFeature = discord => {
	const gameManager = new WerewolfManager();

	const characters = Object.values(Character);

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
					await gameManager.cancel();

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
					if (!gameManager.isMaster(message.author.id)) break;

					const forcedRoles = isProduction
						? undefined
						: (value
								.split(/\s+/g)
								.map(x => x.toLowerCase())
								.filter(x => characters.includes(x as any)) as Character[]);

					await gameManager.start(forcedRoles);

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
				case "!kick":
				case "!ban": {
					if (command === "!kick" && !gameManager.isMaster(message.author.id))
						break;

					if (
						command === "!ban" &&
						!message.member?.roles.cache.find(role => role.name === "mods")
					)
						return;

					const member = message.mentions.users.first();

					if (!member) break;

					await gameManager.leave(
						member.id,
						command === "!kick",
						command === "!ban"
					);

					break;
				}
				case "!add":
				case "!remove": {
					const character = value.toLowerCase();

					if (!gameManager.isMaster(message.author.id)) break;

					if (!characters.includes(character as any)) break;

					await gameManager.manageCharacter(
						character as Character,
						command === "!add"
					);

					break;
				}
				case "!rules": {
					const role = value.toLowerCase();

					if (!characters.includes(role as any)) break;

					await gameManager.rules(role as Character);

					break;
				}
				case "!master":
				case "!forcemaster": {
					if (command === "!master" && !gameManager.isMaster(message.author.id))
						break;

					if (
						command === "!forcemaster" &&
						!message.member?.roles.cache.find(role => role.name === "mods")
					)
						break;

					const member = message.mentions.users.first();

					if (!member) break;

					await gameManager.setMaster(member.id);

					break;
				}
				case "!expert": {
					if (!gameManager.isMaster(message.author.id)) break;

					await gameManager.toggleExpert();

					break;
				}
				case "!timer": {
					if (!gameManager.isMaster(message.author.id)) break;

					const [timer, seconds] = messageSplitter(value, 2);

					if (
						!["game", "role"].includes(timer) ||
						Number.isNaN(parseInt(seconds, 10))
					)
						break;

					await gameManager.changeTimer(
						timer as "game" | "role",
						parseInt(seconds, 10)
					);

					break;
				}
				case "!emoji": {
					if (!message.member?.roles.cache.find(role => role.name === "mods"))
						break;

					const action = value.toLowerCase();

					if (action !== "add" && action !== "remove") break;

					await gameManager.mangageEmojis(message.guild!, action === "add");

					break;
				}
				default:
					break;
			}
		}

		switch (command) {
			case "!volume": {
				if (!gameManager.isMaster(message.author.id)) break;

				if (Number.isNaN(parseInt(value, 10))) break;

				await gameManager.changeVolume(parseInt(value, 10));

				break;
			}
			default:
				break;
		}
	});

	discord.on("messageReactionAdd", async (reaction, user) => {
		if (user.bot) return;

		switch (gameManager.currentState) {
			case GameState.DAY:
			case GameState.VOTING:
				if (reaction.message.channel.type !== "text") return;
				if (reaction.message.channel.name !== prefixChannel("werewolf")) return;
				break;
			case GameState.NIGHT:
				if (reaction.message.channel.type !== "dm") return;
				break;
			default:
				return;
		}

		await gameManager.handleReaction(reaction, user as Discord.User);
	});
};
