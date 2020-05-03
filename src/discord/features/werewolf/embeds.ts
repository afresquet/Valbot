import Discord from "discord.js";
import { AudioManager } from "../../../helpers/AudioManager";
import { capitalize } from "../../../helpers/capitalize";
import { Character } from "./Character";
import { characters } from "./characters";
import { numberEmojis } from "./emojis";
import { findPlayerById } from "./helpers/findPlayerById";
import { listOfEveryone } from "./helpers/listOfEveryone";
import { Player } from "./Player";

export class Embeds {
	constructor(private audioManager: AudioManager) {}

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
		gameTimer: number,
		roleTimer: number,
		expert: boolean
	) {
		const playersValue = players.reduce((result, player, index) => {
			const playerLine = `${numberEmojis[index]} ${player.member.displayName} ${
				player.master ? "(Master)" : ""
			}`;

			return index === 0 ? playerLine : `${result}\n${playerLine}`;
		}, "No players have joined yet.");

		let charactersValue = "";
		for (const [name, character] of characters) {
			if (character.amount === 0) continue;

			const characterName = capitalize(name);

			const line = `${characterName}: ${character.amount}`;

			charactersValue =
				charactersValue === "" ? line : `${charactersValue}\n${line}`;
		}

		return this.base({
			fields: [
				{
					name: "Players",
					value: playersValue,
				},
				{
					name: "Characters",
					value: charactersValue || "No characters have been set yet.",
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
		const character = characters.get(player.role!)!;

		return this.base({
			title: `Your role is ${capitalize(player.role!)}!`,
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

	day(players: Player[], remainingTime: number) {
		const tokens: Character[] = [];
		for (const [name, character] of characters) {
			tokens.push(...new Array<Character>(character.amount).fill(name));
		}

		return this.base({
			title: `Timer: ${remainingTime} seconds remaining.`,
			fields: [
				{
					name: "Players",
					value: players.reduce((result, current, index) => {
						const playerLine = `${numberEmojis[index]} ${
							current.member.displayName
						} ${
							current.claimedRole
								? `- Claims to be ${capitalize(current.claimedRole)}.`
								: ""
						}`;

						return result === "There are no players."
							? playerLine
							: `${result}\n${playerLine}`;
					}, "There are no players."),
				},
				{
					name: "Tokens",
					value: tokens.map(token => capitalize(token)).join("\n"),
				},
			],
		});
	}

	voting(players: Player[]) {
		const votedValue = players.reduce((result, player) => {
			if (!player.killing) return result;

			const target = findPlayerById(players, player.killing)!;

			const playerLine = `${player.member.displayName} is killing ${target.member.displayName}.`;

			return result === "No one has voted yet."
				? playerLine
				: `${result}\n${playerLine}`;
		}, "No one has voted yet.");

		const pendingValue = players.reduce((result, player) => {
			if (player.killing) return result;

			const playerLine = `${player.member.displayName} is choosing who to kill.`;

			return result === "Everyone has voted already."
				? playerLine
				: `${result}\n${playerLine}`;
		}, "Everyone has voted already.");

		return this.base({
			title: "Vote for who you want to kill!",
			description:
				"If you don't vote for someone in time, the player with the next number from yours will become your vote.",
			footer: {
				text: "You can't vote for yourself.",
			},
			fields: [
				{
					name: "Players",
					value: listOfEveryone(players),
				},
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
}
