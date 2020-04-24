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
		description: "React to this message with your choice!",
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
			if (
				current.initialRole === "doppelganger" &&
				(current as Player<"doppelganger">).action.role.character !== role
			) {
				return result;
			} else if (
				current.initialRole !== "doppelganger" &&
				current.initialRole !== role
			) {
				return result;
			}

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
		const role =
			player.initialRole === "doppelganger" &&
			(player as Player<"doppelganger">).action?.ready
				? (player as Player<"doppelganger">).action.role.character
				: player.initialRole;

		switch (role) {
			case "doppelganger":
				return this.doppelgangerNightActionDM(players, player);
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

	titleRole(player: Player) {
		if (player.initialRole !== "doppelganger")
			return capitalize(player.initialRole!);

		return `Doppelganger-${capitalize(
			(player as Player<"doppelganger">).action.role.character
		)}`;
	}

	doppelgangerNightActionDM(
		players: Player[],
		player: Player
	): Discord.MessageEmbed {
		const doppelganger = player as Player<"doppelganger">;

		if (doppelganger.action) {
			const target = this.findPlayerById(players, doppelganger.action.player)!;

			const hasAction = [
				"minion",
				"seer",
				"robber",
				"troublemaker",
				"drunk",
			].includes(doppelganger.action.role.character);

			return this.base({
				...this.nightActionDMCommon("doppelganger"),
				title: `Doppelganger, you copied the role from ${target.member.displayName}:`,
				description: `You became a ${doppelganger.action.role.character}! ${
					hasAction ? "Your action will show up right after this message." : ""
				}`,
				image: { url: characters[doppelganger.action.role.character].image },
			});
		}

		return this.base({
			...this.nightActionDMCommon("doppelganger"),
			title: "Doppelganger, choose a player to become their role.",
			description: listOfEveryone(players, [doppelganger.member.id]),
		});
	}

	werewolfAndMasonNightActionDM(
		players: Player[],
		player: Player
	): Discord.MessageEmbed {
		const role =
			player.initialRole === "doppelganger"
				? (player as Player<"doppelganger">).action.role.character
				: player.initialRole!;

		return this.base({
			...this.nightActionDMCommon(player.initialRole!),
			title: `${this.titleRole(player)}, this is your team:`,
			description: this.nightTeammatesDescription(
				players,
				role,
				player.member.id
			),
		});
	}

	minionNightActionDM(players: Player[], player: Player): Discord.MessageEmbed {
		return this.base({
			...this.nightActionDMCommon(player.initialRole!),
			title: `${this.titleRole(player)}, these are the werewolves:`,
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
	): Discord.MessageEmbed {
		const seer = player as Player<"seer">;
		const doppelgangerSeer = player as Player<"doppelganger", "seer">;

		if (
			player.initialRole === "doppelganger"
				? doppelgangerSeer.action?.role?.action?.player
				: seer.action?.player
		) {
			const targetId =
				player.initialRole === "doppelganger"
					? doppelgangerSeer.action.role.action.player!
					: seer.action.player!;
			const target = this.findPlayerById(players, targetId)!;

			return this.base({
				...this.nightActionDMCommon(player.initialRole!),
				title: `${this.titleRole(player)}, this is ${
					target.member.displayName
				}'s role:`,
				description: capitalize(target.role!),
				image: {
					url: characters[target.role!].image,
				},
			});
		} else if (
			player.initialRole === "doppelganger"
				? doppelgangerSeer.action?.role?.action?.first &&
				  doppelgangerSeer.action?.role?.action?.second === null
				: seer.action?.first !== null && seer.action?.second === null
		) {
			const first =
				player.initialRole === "doppelganger"
					? doppelgangerSeer.action.role.action.first!
					: seer.action.first!;

			return this.base({
				...this.nightActionDMCommon(player.initialRole!),
				title: `${this.titleRole(player)}, choose another center role to view.`,
				description: `You already chose to view the role on the ${centerCardPosition(
					first
				)}.`,
			});
		} else if (
			player.initialRole === "doppelganger"
				? doppelgangerSeer.action?.role?.action?.first &&
				  doppelgangerSeer.action?.role?.action?.second
				: seer.action?.first && seer.action?.second
		) {
			const first =
				player.initialRole === "doppelganger"
					? doppelgangerSeer.action.role.action.first!
					: seer.action.first!;
			const second =
				player.initialRole === "doppelganger"
					? doppelgangerSeer.action.role.action.second!
					: seer.action.second!;

			return this.base({
				...this.nightActionDMCommon(player.initialRole!),
				title: `${this.titleRole(
					player
				)}, these are the center roles you chose to view:`,
				fields: [
					{
						name: centerCardPosition(first),
						value: capitalize(centerCards[first]),
					},
					{
						name: centerCardPosition(second),
						value: capitalize(centerCards[second]),
					},
				],
			});
		}

		return this.base({
			...this.nightActionDMCommon(player.initialRole!),
			title: `${this.titleRole(
				player
			)}, choose a player to view their role, or view two roles from the center:`,
			fields: [
				{
					name: "Players",
					value: listOfEveryone(players, [player.member.id]),
				},
				{
					name: "Center",
					value: `${centerEmojis[0]} Left\n${centerEmojis[1]} Middle\n${centerEmojis[2]} Right`,
				},
			],
		});
	}

	robberNightActionDM(players: Player[], player: Player): Discord.MessageEmbed {
		const robber = player as Player<"robber">;
		const doppelgangerRobber = player as Player<"doppelganger", "robber">;

		if (
			player.initialRole === "doppelganger"
				? doppelgangerRobber.action?.role?.action?.player
				: robber.action?.player
		) {
			const targetId =
				player.initialRole === "doppelganger"
					? doppelgangerRobber.action.role.action.player
					: robber.action.player;
			const target = this.findPlayerById(players, targetId)!;

			return this.base({
				...this.nightActionDMCommon(player.initialRole!),
				title: `You stole the role from ${target.member.displayName}!`,
				description: `You became a ${capitalize(player.role!)}.`,
				image: {
					url: characters[player.role!].image,
				},
			});
		}

		return this.base({
			...this.nightActionDMCommon(player.initialRole!),
			title: `${this.titleRole(
				player
			)}, choose another player to steal their role:`,
			fields: [
				{
					name: "Players",
					value: listOfEveryone(players, [player.member.id]),
				},
			],
		});
	}

	troublemakerNightActionDM(
		players: Player[],
		player: Player
	): Discord.MessageEmbed {
		const troublemaker = player as Player<"troublemaker">;
		const doppelgangerTroublemaker = player as Player<
			"doppelganger",
			"troublemaker"
		>;

		if (
			player.initialRole === "doppelganger"
				? doppelgangerTroublemaker.action?.role?.action?.first &&
				  doppelgangerTroublemaker.action?.role?.action?.second === null
				: troublemaker.action?.first && troublemaker.action?.second === null
		) {
			const firstId =
				player.initialRole === "doppelganger"
					? doppelgangerTroublemaker.action.role.action.first!
					: troublemaker.action.first!;
			const first = this.findPlayerById(players, firstId)!;
			const firstIndex = players.indexOf(first);

			return this.base({
				...this.nightActionDMCommon(player.initialRole!),
				title: `${this.titleRole(
					player
				)}, choose two other players to swap their roles:`,
				fields: [
					{
						name: "Picked",
						value: `${numberEmojis[firstIndex]} ${first.member.displayName}`,
					},
					{
						name: "Players",
						value: listOfEveryone(players, [player.member.id]),
					},
				],
			});
		} else if (
			player.initialRole === "doppelganger"
				? doppelgangerTroublemaker.action?.role?.action?.first &&
				  doppelgangerTroublemaker.action?.role?.action?.second !== null
				: troublemaker.action?.first && troublemaker.action?.second !== null
		) {
			const firstId =
				player.initialRole === "doppelganger"
					? doppelgangerTroublemaker.action.role.action.first!
					: troublemaker.action.first!;
			const first = this.findPlayerById(players, firstId)!;
			const firstIndex = players.indexOf(first);

			const secondId =
				player.initialRole === "doppelganger"
					? doppelgangerTroublemaker.action.role.action.second!
					: troublemaker.action.second!;
			const second = this.findPlayerById(players, secondId)!;
			const secondIndex = players.indexOf(second);

			return this.base({
				...this.nightActionDMCommon(player.initialRole!),
				title: `${this.titleRole(
					player
				)}, you swapped the roles of these two players:`,
				description: `${numberEmojis[firstIndex]} ${first.member.displayName}\n${numberEmojis[secondIndex]} ${second.member.displayName}`,
			});
		}

		return this.base({
			...this.nightActionDMCommon(player.initialRole!),
			title: `${this.titleRole(
				player
			)}, choose two other players to swap their roles:`,
			fields: [
				{
					name: "Picked",
					value: "No players have been picked yet.",
				},
				{
					name: "Players",
					value: listOfEveryone(players, [player.member.id]),
				},
			],
		});
	}

	drunkNightActionDM(player: Player): Discord.MessageEmbed {
		const drunk = player as Player<"drunk">;
		const doppelgangerDrunk = player as Player<"doppelganger", "drunk">;

		if (
			player.initialRole === "doppelganger"
				? doppelgangerDrunk.action?.role?.action?.center
				: drunk.action?.center
		) {
			const centerCard =
				player.initialRole === "doppelganger"
					? doppelgangerDrunk.action.role.action.center
					: drunk.action.center;

			return this.base({
				...this.nightActionDMCommon(player.initialRole!),
				title: `${this.titleRole(
					player
				)}, you chose to become the role in the ${centerCardPosition(
					centerCard
				)}.`,
			});
		}

		return this.base({
			...this.nightActionDMCommon(player.initialRole!),
			title: `${this.titleRole(
				player
			)}, choose a role from the center to become that role:`,
			fields: [
				{
					name: "Center roles",
					value: `${centerEmojis[0]} Left\n${centerEmojis[1]} Middle\n${centerEmojis[2]} Right`,
				},
			],
		});
	}

	insomniacNightActionDM(player: Player): Discord.MessageEmbed {
		return this.base({
			...this.nightActionDMCommon(player.initialRole!),
			title: `${this.titleRole(player)}, this is your role:`,
			description: capitalize(player.role!),
			image: {
				url: characters[player.role!].image,
			},
		});
	}
}
