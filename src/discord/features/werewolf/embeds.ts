import Discord from "discord.js";
import { AudioManager } from "../../../helpers/AudioManager";
import { capitalize } from "../../../helpers/capitalize";
import { characters } from "./characters";
import { centerEmojis, numberEmojis } from "./emojis";
import { centerCardPosition } from "./helpers/centerCardPosition";
import { listOfEveryone } from "./helpers/listOfEveryone";
import { Character, CharactersState, Player } from "./types";

export class Embeds {
	constructor(private audioManager: AudioManager) {}

	private findPlayerById(players: Player[], id: string) {
		return players.find(player => player.member.id === id);
	}

	private nightActionDMCommon = (
		character: Character
	): Discord.MessageEmbedOptions => ({
		footer: { text: "This message will expire soon, act fast!" },
		thumbnail: { url: characters[character].image },
	});

	base(options: Discord.MessageEmbedOptions) {
		return new Discord.MessageEmbed({
			author: {
				name: "One Night Ultimate Werewolf",
				icon_url:
					"https://image.winudf.com/v2/image1/Y29tLm1vYmllb3Mua2FyYW4uV29sZl9BbmRyb2lkMTRfMTFfMTNfaWNvbl8xNTU2NjQ4NDY4XzA0NA/icon.png?w=340&fakeurl=1",
			},
			footer: {
				text: `Volume: ${100 * <number>this.audioManager.getOption("volume")}%`,
			},
			...options,
		});
	}

	preparation(
		players: Player[],
		characters: CharactersState,
		gameTimer: number,
		roleTimer: number,
		expert: boolean
	) {
		return this.base({
			fields: [
				{
					name: "Players",
					value: players.reduce((result, player, index) => {
						const playerLine = `${numberEmojis[index]} ${
							player.member.displayName
						} ${player.master ? "(Master)" : ""}`;

						return index === 0 ? playerLine : `${result}\n${playerLine}`;
					}, "No players have joined yet."),
				},
				{
					name: "Characters",
					value: characters.reduce((result, character) => {
						const characterName = capitalize(character.character);

						const nextLine =
							result === "No characters have been set yet."
								? `${characterName}: ${character.amount}`
								: `${result}\n${characterName}: ${character.amount}`;

						return character.amount > 0 ? nextLine : result;
					}, "No characters have been set yet."),
				},
				{
					name: "Game Timer",
					value: `${gameTimer} seconds`,
					inline: true,
				},
				{
					name: "Role Timer",
					value: `${roleTimer} seconds`,
					inline: true,
				},
				{
					name: "Expert Mode",
					value: expert ? "On" : "Off",
					inline: true,
				},
			],
		});
	}

	roleAssigning() {
		return this.base({
			title: "Check your DMs to view your role!",
			description: "Game will begin shortly, be prepared!",
		});
	}

	role(player: Player) {
		const character = characters[player.initialRole!];

		return this.base({
			title: `Your role is ${capitalize(player.initialRole!)}!`,
			description: character.description,
			footer: {
				text:
					"This message will self destruct soon, go to sleep to stay safe from it!",
			},
			image: {
				url: character.image,
			},
		});
	}

	night() {
		return this.base({
			title:
				"It's night time! Fall asleep, and wake up when your role is called.",
			description: "schleeeeeeeeeeeeeepy time",
			image: {
				url:
					"https://www.petmd.com/sites/default/files/shutterstock_395310793.jpg",
			},
		});
	}

	private nightTeammatesDescription(
		players: Player[],
		role: Character,
		id: string
	) {
		const placeholder = `There are no ${role} players!`;

		return players.reduce((result, current, index) => {
			if (current.initialRole !== role) return result;

			const playerLine = `${numberEmojis[index]} ${
				current.member.displayName
			} ${current.member.id === id ? "(You)" : ""}`;

			return result === placeholder ? playerLine : `${result}\n${playerLine}`;
		}, placeholder);
	}

	nightActionDM(
		players: Player[],
		player: Player,
		centerCards?: Character[]
	): Discord.MessageEmbed {
		switch (player.initialRole) {
			case "doppelganger":
				return this.doppelgangerNightActionDM();
			case "werewolf":
			case "mason":
				return this.werewolfAndMasonNightActionDM(players, player);
			case "minion":
				return this.minionNightActionDM(players, player);
			case "seer":
				return this.seerNightActionDM(players, player, centerCards!);
			case "robber":
				return this.robberNightActionDM(players, player);
			case "troublemaker":
				return this.troublemakerNightActionDM(players, player);
			case "drunk":
				return this.drunkNightActionDM(player);
			case "insomniac":
				return this.insomniacNightActionDM(player);
			default:
				throw new Error(
					`Unhandled night action character "${player.initialRole}".`
				);
		}
	}

	day() {
		return this.base({
			title:
				"I'm hoping to make a timer that counts down here idk how I'll do it.",
		});
	}

	voting(players: Player[]) {
		const votedValue = players.reduce((result, player, _) => {
			if (player.killing === null) return result;

			const target = this.findPlayerById(players, player.killing)!;

			const playerLine = `${player.member.displayName} is killing ${target.member.displayName}.`;

			return result === "No one has voted yet."
				? playerLine
				: `${result}\n${playerLine}`;
		}, "No one has voted yet.");

		const pendingValue = players.reduce((result, player) => {
			if (player.killing !== null) return result;

			const playerLine = `${player.member.displayName} is choosing who to kill.`;

			return result === "Everyone has voted already."
				? playerLine
				: `${result}\n${playerLine}`;
		}, "Everyone has voted already.");

		return this.base({
			title: "Vote for who you want to kill!",
			description: "Check your DMs to vote.",
			footer: {},
			fields: [
				{
					name: "Voted",
					value: votedValue,
				},
				{
					name: "Pending",
					value: pendingValue,
				},
			],
		});
	}

	playerVoting(players: Player[], player: Player) {
		const playerIndex = players.indexOf(player);

		return this.base({
			title: "Vote for who you want to kill!",
			footer: { text: "This message will expire soon, act fast!" },
			fields: [
				{
					name: "Players",
					value: players.reduce((result, current, index, array) => {
						if (current.member.id === player.member.id) return result;

						const playerLine = `${numberEmojis[index]} ${
							current.member.displayName
						} ${
							(index + 1) % array.length === playerIndex ? "(Default vote)" : ""
						}`;

						return result === "There are no players."
							? playerLine
							: `${result}\n${playerLine}`;
					}, "There are no players."),
				},
			],
		});
	}

	doppelgangerNightActionDM() {
		return this.base({
			...this.nightActionDMCommon,
			title: "Doppelganger hasn't been implemented into the game yet!",
		});
	}

	werewolfAndMasonNightActionDM(players: Player[], player: Player) {
		return this.base({
			...this.nightActionDMCommon,
			title: `${capitalize(player.initialRole!)}, this is your team:`,
			description: this.nightTeammatesDescription(
				players,
				player.initialRole!,
				player.member.id
			),
		});
	}

	minionNightActionDM(players: Player[], player: Player) {
		return this.base({
			...this.nightActionDMCommon,
			title: "Minion, these are the werewolves:",
			description: this.nightTeammatesDescription(
				players,
				"werewolf",
				player.member.id
			),
		});
	}

	seerNightActionDM(
		players: Player[],
		player: Player,
		centerCards: Character[]
	) {
		const seer = player as Player<"seer">;

		if (seer.action !== null) {
			if (seer.action.player !== null) {
				const target = this.findPlayerById(players, seer.action.player)!;

				return this.base({
					...this.nightActionDMCommon,
					title: `Seer, this is ${target.member.displayName}'s role:`,
					description: capitalize(target.role!),
					image: {
						url: characters[target.role!].image,
					},
				});
			} else if (seer.action.first !== null && seer.action.second === null) {
				return this.base({
					...this.nightActionDMCommon,
					title: "Seer, choose another center role to view.",
					description: `You already chose to view the role on the ${centerCardPosition(
						seer.action.first
					)}.`,
				});
			} else if (seer.action.first !== null && seer.action.second !== null) {
				return this.base({
					...this.nightActionDMCommon,
					title: "Seer, these are the center roles you chose to view:",
					fields: [
						{
							name: centerCardPosition(seer.action.first),
							value: capitalize(centerCards[seer.action.first]),
						},
						{
							name: centerCardPosition(seer.action.second),
							value: capitalize(centerCards[seer.action.second]),
						},
					],
				});
			}
		}

		return this.base({
			...this.nightActionDMCommon,
			title:
				"Seer, choose a player to view their role, or view two roles from the center:",
			fields: [
				{
					name: "Players",
					value: listOfEveryone(players, [seer.member.id]),
				},
				{
					name: "Center",
					value: `${centerEmojis[0]} Left\n${centerEmojis[1]} Middle\n${centerEmojis[2]} Right`,
				},
			],
		});
	}

	robberNightActionDM(players: Player[], player: Player) {
		const robber = player as Player<"robber">;

		if (robber.action === null) {
			return this.base({
				...this.nightActionDMCommon,
				title: "Robber, choose another player to steal their role:",
				description: listOfEveryone(players, [robber.member.id]),
			});
		} else {
			const target = this.findPlayerById(players, robber.action.player)!;

			return this.base({
				...this.nightActionDMCommon,
				title: `You stole the role from ${target.member.displayName}!`,
				description: `You became a ${capitalize(robber.role!)}.`,
				image: {
					url: characters[robber.role!].image,
				},
			});
		}
	}

	troublemakerNightActionDM(players: Player[], player: Player) {
		const troublemaker = player as Player<"troublemaker">;

		if (troublemaker.action !== null) {
			if (
				troublemaker.action.first !== null &&
				troublemaker.action.second === null
			) {
				const first = this.findPlayerById(players, troublemaker.action.first)!;
				const firstIndex = players.indexOf(first);

				return this.base({
					...this.nightActionDMCommon,
					title: "Troublemaker, choose two other players to swap their roles:",
					fields: [
						{
							name: "Picked",
							value: `${numberEmojis[firstIndex]} ${first.member.displayName}`,
						},
						{
							name: "Players",
							value: listOfEveryone(players, [troublemaker.member.id]),
						},
					],
				});
			} else if (
				troublemaker.action.first !== null &&
				troublemaker.action.second !== null
			) {
				const first = this.findPlayerById(players, troublemaker.action.first)!;
				const firstIndex = players.indexOf(first);
				const second = this.findPlayerById(
					players,
					troublemaker.action.second
				)!;
				const secondIndex = players.indexOf(second);

				return this.base({
					...this.nightActionDMCommon,
					title: "Troublemaker, you swapped the roles of these two players:",
					description: `${numberEmojis[firstIndex]} ${first.member.displayName}\n${numberEmojis[secondIndex]} ${second.member.displayName}`,
				});
			}
		}

		return this.base({
			...this.nightActionDMCommon,
			title: "Troublemaker, choose two other players to swap their roles:",
			fields: [
				{
					name: "Picked",
					value: "No players have been picked yet.",
				},
				{
					name: "Players",
					value: listOfEveryone(players, [troublemaker.member.id]),
				},
			],
		});
	}

	drunkNightActionDM(player: Player) {
		const drunk = player as Player<"drunk">;

		if (drunk.action === null) {
			return this.base({
				...this.nightActionDMCommon,
				title: "Drunk, choose a card from the center to become that role:",
				description: `${centerEmojis[0]} Left\n${centerEmojis[1]} Middle\n${centerEmojis[2]} Right`,
			});
		} else {
			return this.base({
				...this.nightActionDMCommon,
				title: `Drunk, you chose to become the role in the ${centerCardPosition(
					drunk.action.center
				)}.`,
			});
		}
	}

	insomniacNightActionDM(player: Player) {
		return this.base({
			...this.nightActionDMCommon,
			title: "Insomniac, this is your role:",
			description: capitalize(player.role!),
			image: {
				url: characters[player.role!].image,
			},
		});
	}
}
