import Discord from "discord.js";
import { join } from "path";
import { capitalize } from "../../../helpers/capitalize";
import { clamp } from "../../../helpers/clamp";
import { delay } from "../../../helpers/delay";
import { prefixChannel, prefixRole } from "../../../helpers/prefixString";
import { State } from "../../../helpers/State";
import { characters } from "./characters";
import {
	centerEmojis,
	Character,
	Characters,
	DrunkAction,
	GameState,
	NightActionCharacter,
	NightActionCharacters,
	numberEmojis,
	Player,
	RobberAction,
	SeerAction,
	TroublemakerAction,
} from "./types";
import { WerewolfAudioManager } from "./WerewolfAudioManager";

const order = (index: number) =>
	index === 0 ? "Left" : index === 1 ? "Middle" : "Right";

export class WerewolfManager {
	private textChannel: Discord.TextChannel | null = null;
	private audioManager = new WerewolfAudioManager();
	private playerRole: Discord.Role | null = null;

	private players = new State<Player[]>([]);
	private centerCards = new State<Character[]>([]);

	private gameState = new State<GameState>("NOT_PLAYING");
	private gameMessage: Discord.Message | null = null;
	private nightActionDM: Discord.Message | null = null;

	private expert = new State(false);

	private gameTimer = new State(300);
	private roleTimer = new State(10);

	private characters = new State<{ character: Character; amount: number }[]>(
		Characters.map(character => ({ character, amount: 0 }))
	);

	private soundPath(sound: string) {
		return join(__dirname, `../../../../assets/werewolf/sounds/${sound}.mp3`);
	}

	isReady() {
		return this.textChannel !== null && this.audioManager.isReady();
	}

	isPlaying() {
		return (
			this.gameState.current !== "NOT_PLAYING" &&
			this.gameState.current !== "PREPARATION"
		);
	}

	isMaster(id: string) {
		return !!this.players.current.find(p => p.member.id === id)?.master;
	}

	setup(guild: Discord.Guild) {
		if (!this.textChannel) {
			const textChannelName = prefixChannel("werewolf");

			const textChannel = guild.channels.cache.find(
				c => c.name === textChannelName
			) as Discord.TextChannel;

			if (!textChannel) {
				throw new Error(`There's no #${textChannelName} text channel!`);
			}

			this.textChannel = textChannel;
		}

		if (!this.audioManager.isReady()) {
			const voiceChannelName = prefixChannel("vc-werewolf");

			const voiceChannel = guild.channels.cache.find(
				c => c.name === voiceChannelName
			) as Discord.VoiceChannel;

			if (!voiceChannel) {
				throw new Error(`There's no #${voiceChannelName} voice channel!`);
			}

			this.audioManager.setVoiceChannel(voiceChannel);
		}

		if (!this.playerRole) {
			const playerRoleName = prefixRole("werewolf player");

			const playerRole = guild.roles.cache.find(r => r.name === playerRoleName);

			if (!playerRole) {
				throw new Error(`There's no #${playerRoleName} role!`);
			}

			this.playerRole = playerRole;
		}
	}

	async join(member: Discord.GuildMember) {
		if (this.players.current.find(p => p.member.id === member.id)) return;

		const player: Player = {
			master: false,
			member,
			initialRole: null,
			role: null,
			action: null,
			killing: null,
		};

		if (this.players.current.length === 0) {
			await this.audioManager.join();

			player.master = true;
		}

		this.players.set(curr => [...curr, player]);

		member.roles.add(this.playerRole!);

		await this.refreshEmbed();
	}

	async leave(memberId: string) {
		const player = this.players.current.find(p => p.member.id === memberId);

		if (!player) return;

		this.players.set(curr => curr.filter(p => p.member.id !== memberId));

		player.member.roles.remove(this.playerRole!);

		if (this.players.current.length <= 0) {
			this.audioManager.leave();
		} else if (player.master) {
			this.randomMaster();
		}

		await this.refreshEmbed();
	}

	async newGame() {
		if (!this.textChannel) return;

		if (this.gameState.current !== "NOT_PLAYING") return;

		this.gameMessage = await this.textChannel.send(this.preparationEmbed());

		this.gameState.set(() => "PREPARATION");
	}

	async manageCharacter(character: Character, add: boolean) {
		this.characters.set(curr =>
			curr.map(c =>
				c.character === character
					? { ...c, amount: clamp(c.amount + (add ? 1 : -1), 0, 3) }
					: c
			)
		);

		await this.refreshEmbed();
	}

	async start() {
		if (this.gameState.current !== "PREPARATION") return;

		const charactersAmount = this.characters.current.reduce(
			(result, current) => result + current.amount,
			0
		);
		const playersAmount = this.players.current.length;

		if (playersAmount < 3) return;

		if (charactersAmount !== playersAmount + 3) return;

		await this.assignRoles();

		await this.night();

		await this.day();

		await this.voting();

		await this.finish();

		this.cleanUp();
	}

	private async assignRoles() {
		this.gameState.set(() => "ROLE_ASSIGNING");

		const roles = this.characters.current.reduce<Character[]>(
			(result, current) => [
				...result,
				...new Array(current.amount).fill(current.character),
			],
			[]
		);

		this.players.set(curr =>
			curr.map(player => {
				const randomIndex = Math.floor(Math.random() * roles.length);
				const [role] = roles.splice(randomIndex, 1);

				return { ...player, initialRole: role, role };
			})
		);

		this.centerCards.set(() => roles);

		await this.refreshEmbed();

		const messages = await Promise.all(
			this.players.current.map(player =>
				player.member.send(this.roleEmbed(player))
			)
		);

		await delay(this.roleTimer.current * 1000);

		await Promise.all(messages.map(message => message.delete()));
	}

	private async night() {
		this.gameState.set(() => "NIGHT");

		await this.refreshEmbed();

		await Promise.all([
			this.audioManager.play(this.soundPath(characters.everyone.sounds.close)),
			this.muteAll(true),
		]);

		for (const character of NightActionCharacters) {
			await this.playCharacter(character);
		}

		await delay(2000);
	}

	private async day() {
		this.gameState.set(() => "DAY");

		this.refreshEmbed();

		await this.audioManager.play(
			this.soundPath(characters.everyone.sounds.wake)
		);

		await this.muteAll(false);

		await delay(this.gameTimer.current * 1000);
	}

	private async voting() {
		this.gameState.set(() => "VOTING");

		await this.audioManager.play(
			this.soundPath(characters.everyone.sounds.timeisup)
		);

		const messages = await Promise.all(
			this.players.current.map(async (player, index, array) => {
				const message = await player.member.send(
					this.playerVotingEmbed(player)
				);

				for (let i = 0; i < array.length; i++) {
					if (i === index) continue;

					await message.react(numberEmojis[i]);
				}

				return message;
			})
		);

		await this.refreshEmbed();

		await delay(this.roleTimer.current * 1000);

		await Promise.all(messages.map(message => message.delete()));
	}

	private async finish() {
		this.gameState.set(() => "NOT_PLAYING");

		if (!this.gameMessage) return;

		const players = this.players.current;

		const votes = players.reduce<{ [player: string]: number }>(
			(result, player) => {
				if (player.killing === null) return result;

				const id = players[player.killing!].member.id;

				return {
					...result,
					[id]: result[id] ? result[id] + 1 : 1,
				};
			},
			{}
		);

		const [killedId, killedVotes] = Object.entries(votes).reduce(
			(result, amount) => (amount[1] > result[1] ? amount : result),
			["", 0]
		);

		const killed = players.find(p => p.member.id === killedId)!;

		const fields: Discord.EmbedFieldData[] = [];

		const seer = players.find(p => p.initialRole === "seer")!;
		if (seer) {
			const action = seer.action as SeerAction;

			let value = "";
			if (action.player !== null) {
				value = `Viewed the role of ${
					players[action.player!].member.displayName
				}.`;
			} else {
				value = `Viewed the roles at the ${order(
					action.center![0]!
				)} and at the ${order(action.center![1]!)}.`;
			}

			fields.push({ name: `${seer.member.displayName} (Seer)`, value });
		}

		const robber = players.find(p => p.initialRole === "robber")!;
		if (robber) {
			const action = robber.action as RobberAction;

			fields.push({
				name: `${robber.member.displayName} (Robber)`,
				value: `Stole the role from ${
					players[action.player].member.displayName
				}.`,
			});
		}

		const troublemaker = players.find(p => p.initialRole === "troublemaker")!;
		if (troublemaker) {
			const action = troublemaker.action as TroublemakerAction;

			fields.push({
				name: `${troublemaker.member.displayName} (Troublemaker)`,
				value: `Swapped the roles of ${
					players[action.first!].member.displayName
				} and ${players[action.first!].member.displayName}.`,
			});
		}

		const drunk = players.find(p => p.initialRole === "drunk")!;
		if (drunk) {
			const action = drunk.action as DrunkAction;

			fields.push({
				name: `${robber.member.displayName} (Robber)`,
				value: `Took the role from the center at the ${order(action.center)}.`,
			});
		}

		fields.push({
			name: "Final roles",
			value: players.reduce((result, current, index) => {
				const role =
					current.initialRole !== current.role
						? `${current.initialRole} -> ${current.role}`
						: current.role;
				const playerLine = `${numberEmojis[index]} ${current.member.displayName}: ${role}`;

				return result === "" ? playerLine : `${result}\n${playerLine}`;
			}, ""),
		});

		await this.gameMessage.edit(
			this.baseEmbed({
				footer: {},
				timestamp: Date.now(),
				title: `${killed.member.displayName} was killed with ${killedVotes} votes!`,
				description: players.reduce((result, current, index) => {
					if (current.killing === null) return result;

					const playerLine = `${numberEmojis[index]} ${
						current.member.id
					} voted ${players[current.killing].member.id}.`;

					return result === "No votes happened"
						? playerLine
						: `${result}\n${playerLine}`;
				}, "No votes happened"),
				thumbnail: {
					url: characters[killed.role!].image,
				},
				fields,
			})
		);

		this.gameMessage = null;
	}

	private cleanUp() {
		this.players.set(curr =>
			curr.map(player => ({
				...player,
				initialRole: null,
				role: null,
				action: null,
				killing: null,
			}))
		);

		this.centerCards.set(() => []);
	}

	async rules(character: Character) {
		await this.audioManager.play(
			this.soundPath(characters[character].sounds.name)
		);
		await this.audioManager.play(
			this.soundPath(characters[character].sounds.rules)
		);
	}

	private async muteAll(on: boolean) {
		await this.audioManager.muteAll(on);
	}

	async setMaster(memberId: string) {
		if (!this.players.current.find(p => p.member.id === memberId)) return;

		this.players.set(curr =>
			curr.map(p => ({ ...p, master: p.member.id === memberId }))
		);

		await this.refreshEmbed();
	}

	private randomMaster() {
		const randomIndex = Math.floor(Math.random() * this.players.current.length);

		this.players.set(curr =>
			curr.map((player, index) =>
				index === randomIndex ? { ...player, master: true } : player
			)
		);
	}

	async toggleExpert() {
		this.expert.set(curr => !curr);

		await this.refreshEmbed();
	}

	async changeTimer(timer: "game" | "role", seconds: number) {
		if (timer === "game") {
			this.gameTimer.set(() => (seconds > 0 ? seconds : 0));
		} else if (timer === "role") {
			this.roleTimer.set(() => (seconds > 0 ? seconds : 0));
		}

		await this.refreshEmbed();
	}

	async changeVolume(volume: number) {
		this.audioManager.setVolume(volume);

		await this.refreshEmbed();
	}

	private async playCharacter(character: NightActionCharacter) {
		if (
			this.characters.current.find(c => c.character === character)!.amount <= 0
		)
			return;

		if (this.expert.current) {
			await this.audioManager.play(
				this.soundPath(characters[character].sounds.expert.wake)
			);
		} else {
			await this.audioManager.play(
				this.soundPath(characters[character].sounds.wake)
			);
		}

		await this.handleNightActionCharacter(character);

		if (character === "minion") {
			await this.audioManager.play(
				this.soundPath(characters.minion.sounds.thumb)
			);
		}

		await this.audioManager.play(
			this.soundPath(characters[character].sounds.close)
		);
	}

	private async handleNightActionCharacter(character: NightActionCharacter) {
		if (["werewolf", "mason"].includes(character)) {
			const players = this.players.current.filter(
				player => player.initialRole === character
			);

			const messages = await Promise.all(
				players.map(player =>
					player.member.send(this.nightActionDMEmbed(player))
				)
			);

			await delay(this.roleTimer.current * 1000);

			await Promise.all(messages.map(message => message.delete()));

			return;
		}

		const player = this.players.current.find(
			player => player.initialRole === character
		)!;

		if (!player) {
			await delay(this.roleTimer.current * 1000);

			return;
		}

		this.nightActionDM = await player.member.send(
			this.nightActionDMEmbed(player)
		);

		if (["seer", "robber", "troublemaker"].includes(character)) {
			for (let i = 0; i < this.players.current.length; i++) {
				if (this.players.current[i].member.id === player.member.id) continue;

				await this.nightActionDM!.react(numberEmojis[i]);
			}
		}

		if (["seer", "drunk"].includes(character)) {
			for (let i = 0; i < centerEmojis.length; i++) {
				await this.nightActionDM!.react(centerEmojis[i]);
			}
		}

		await delay(this.roleTimer.current * 1000);

		await this.nightActionDM.delete();

		this.nightActionDM = null;
	}

	private async refreshEmbed() {
		if (!this.gameMessage) return;

		switch (this.gameState.current) {
			case "PREPARATION":
				await this.gameMessage.edit(this.preparationEmbed());
				break;
			case "ROLE_ASSIGNING":
				await this.gameMessage.edit(this.roleAssigningEmbed());
				break;
			case "NIGHT":
				await this.gameMessage.edit(this.nightEmbed());
				break;
			case "DAY":
				await this.gameMessage.edit(this.dayEmbed());
				break;
			case "VOTING":
				await this.gameMessage.edit(this.votingEmbed());
				break;
			case "NOT_PLAYING":
			default:
				break;
		}
	}

	private async refreshDM(character: Character) {
		if (!this.nightActionDM || this.gameState.current !== "NIGHT") return;

		const player = this.players.current.find(p => p.initialRole === character);

		if (!player) return;

		const common = {
			footer: { text: "This message will expire soon, act fast!" },
			thumbnail: { url: characters[character].image },
		};

		switch (player.initialRole) {
			case "seer": {
				const action = player.action as SeerAction;

				if (action.player !== null) {
					const target = this.players.current[action.player];

					await this.nightActionDM.edit(
						this.baseEmbed({
							...common,
							title: `Seer, this is ${target.member.displayName}'s role:`,
							description: capitalize(target.role!),
							image: {
								url: characters[target.role!].image,
							},
						})
					);
				} else if (action.center.every(x => x !== null)) {
					await this.nightActionDM.edit(
						this.baseEmbed({
							...common,
							title: "Seer, these are the center roles you chose to view:",
							fields: [
								{
									name: order(action.center[0]!),
									value: capitalize(
										this.centerCards.current[action.center[0]!]
									),
								},
								{
									name: order(action.center[1]!),
									value: capitalize(
										this.centerCards.current[action.center[1]!]
									),
								},
							],
						})
					);
				} else if (action.center.some(x => x === null)) {
					await this.nightActionDM.edit(
						this.baseEmbed({
							...common,
							title: "Seer, choose another center role to view.",
							description: `You already chose to view the role on the ${order(
								action.center[0]!
							)}.`,
						})
					);
				}

				break;
			}
			case "robber": {
				const action = player.action as RobberAction;

				await this.nightActionDM.edit(
					this.baseEmbed({
						...common,
						title: `You stole the role from ${
							this.players.current[action.player!].member.displayName
						}!`,
						description: `You became a ${capitalize(player.role!)}.`,
						image: {
							url: characters[player.role!].image,
						},
					})
				);

				break;
			}
			case "troublemaker": {
				const action = player.action as TroublemakerAction;

				if (action.second === null) {
					await this.nightActionDM.edit(
						this.baseEmbed({
							...common,
							title:
								"Troublemaker, choose two other players to swap their roles:",
							fields: [
								{
									name: "Picked",
									value: `${numberEmojis[action.first!]} ${
										this.players.current[action.first!].member.displayName
									}`,
								},
								{
									name: "Players",
									value: this.listOfEveryoneElse(player.member.id),
								},
							],
						})
					);
				} else {
					await this.nightActionDM.edit(
						this.baseEmbed({
							...common,
							title:
								"Troublemaker, you swapped the roles of these two players:",
							description: `${numberEmojis[action.first!]} ${
								this.players.current[action.first!].member.displayName
							}\n${numberEmojis[action.second]} ${
								this.players.current[action.second].member.displayName
							}`,
						})
					);
				}

				break;
			}
			case "drunk": {
				const action = player.action as DrunkAction;

				await this.nightActionDM.edit(
					this.baseEmbed({
						...common,
						title: `Drunk, you chose to become the role in the ${order(
							action.center
						)}.`,
					})
				);

				break;
			}
			default:
				break;
		}
	}

	private baseEmbed(options: Discord.MessageEmbedOptions) {
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

	private preparationEmbed() {
		return this.baseEmbed({
			fields: [
				{
					name: "Players",
					value: this.players.current.reduce((result, player, index) => {
						const playerLine = `${numberEmojis[index]} ${
							player.member.displayName
						} ${player.master ? "(Master)" : ""}`;

						return index === 0 ? playerLine : `${result}\n${playerLine}`;
					}, "No players have joined yet."),
				},
				{
					name: "Characters",
					value: this.characters.current.reduce((result, character) => {
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
					value: `${this.gameTimer.current} seconds`,
					inline: true,
				},
				{
					name: "Role Timer",
					value: `${this.roleTimer.current} seconds`,
					inline: true,
				},
				{
					name: "Expert Mode",
					value: this.expert.current ? "On" : "Off",
					inline: true,
				},
			],
		});
	}

	private roleAssigningEmbed() {
		return this.baseEmbed({
			title: "Check your DMs to view your role!",
			description: "Game will begin shortly, be prepared!",
		});
	}

	private roleEmbed(player: Player) {
		const character = characters[player.initialRole!];

		return this.baseEmbed({
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

	private nightEmbed() {
		return this.baseEmbed({
			title:
				"It's night time! Fall asleep, and wake up when your role is called.",
			description: "schleeeeeeeeeeeeeepy time",
			image: {
				url:
					"https://www.petmd.com/sites/default/files/shutterstock_395310793.jpg",
			},
		});
	}

	private nightActionDMEmbed(player: Player) {
		const common = {
			footer: { text: "This message will expire soon, act fast!" },
			thumbnail: { url: characters[player.initialRole!].image },
		};

		switch (player.initialRole) {
			case "doppelganger":
				return this.baseEmbed({
					...common,
					title: "Doppelganger hasn't been implemented into the game yet!",
				});
			case "werewolf":
			case "mason":
				return this.baseEmbed({
					...common,
					title: `${capitalize(player.initialRole)}, this is your team:`,
					description: this.nightTeammatesDescription(
						player.initialRole,
						player.member.id
					),
				});
			case "minion":
				return this.baseEmbed({
					...common,
					title: "Minion, these are the werewolves:",
					description: this.nightTeammatesDescription(
						"werewolf",
						player.member.id
					),
				});
			case "seer":
				return this.baseEmbed({
					...common,
					title:
						"Seer, choose a player to view their role, or view two roles from the center:",
					fields: [
						{
							name: "Players",
							value: this.listOfEveryoneElse(player.member.id),
						},
						{
							name: "Center",
							value: `${centerEmojis[0]} Left\n${centerEmojis[1]} Middle\n${centerEmojis[2]} Right`,
						},
					],
				});
			case "robber":
				return this.baseEmbed({
					...common,
					title: "Robber, choose another player to steal their role:",
					description: this.listOfEveryoneElse(player.member.id),
				});
			case "troublemaker":
				return this.baseEmbed({
					...common,
					title: "Troublemaker, choose two other players to swap their roles:",
					fields: [
						{
							name: "Picked",
							value: "No players have been picked yet.",
						},
						{
							name: "Players",
							value: this.listOfEveryoneElse(player.member.id),
						},
					],
				});
			case "drunk":
				return this.baseEmbed({
					...common,
					title: "Drunk, choose a card from the center to become that role:",
					description: `${centerEmojis[0]} Left\n${centerEmojis[1]} Middle\n${centerEmojis[2]} Right`,
				});
			case "insomniac":
				return this.baseEmbed({
					...common,
					title: "Insomniac, this is your role:",
					description: capitalize(player.role!),
					image: {
						url: characters[player.role!].image,
					},
				});
			default:
				throw new Error(
					`Unhandled night action character "${player.initialRole}".`
				);
		}
	}

	private nightTeammatesDescription(role: Character, id: string) {
		const placeholder = `There are no ${role} players!`;

		return this.players.current.reduce((result, current, index) => {
			if (current.initialRole !== role) return result;

			const playerLine = `${numberEmojis[index]} ${
				current.member.displayName
			} ${current.member.id === id ? "(You)" : ""}`;

			return result === placeholder ? playerLine : `${result}\n${playerLine}`;
		}, placeholder);
	}

	private listOfEveryoneElse(id: string) {
		return this.players.current.reduce((result, current, index) => {
			if (current.member.id === id) return result;

			const playerLine = `${numberEmojis[index]} ${current.member.displayName}`;

			return result === "There are no players."
				? playerLine
				: `${result}\n${playerLine}`;
		}, "There are no players.");
	}

	private dayEmbed() {
		return this.baseEmbed({
			title:
				"I'm hoping to make a timer that counts down here idk how I'll do it.",
		});
	}

	private votingEmbed() {
		const votedValue = this.players.current.reduce(
			(result, player, _, array) => {
				if (player.killing === null) return result;

				const playerLine = `${player.member.displayName} is killing ${
					array[player.killing].member.displayName
				}.`;

				return result === "" ? playerLine : `${result}\n${playerLine}`;
			},
			""
		);

		const pendingValue = this.players.current.reduce((result, player) => {
			if (player.killing !== null) return result;

			const playerLine = `${player.member.displayName} is choosing who to kill.`;

			return result === "" ? playerLine : `${result}\n${playerLine}`;
		}, "");

		return this.baseEmbed({
			title: "Vote for who you want to kill!",
			description: "Check your DMs to vote.",
			footer: {},
			fields: [
				{
					name: "Voted",
					value: votedValue === "" ? "No one has voted yet." : votedValue,
				},
				{
					name: "Pending",
					value:
						pendingValue === "" ? "Everyone has voted already." : pendingValue,
				},
			],
		});
	}

	private playerVotingEmbed(player: Player) {
		return this.baseEmbed({
			title: "Vote for who you want to kill!",
			footer: { text: "This message will expire soon, act fast!" },
			fields: [
				{
					name: "Players",
					value: this.players.current.reduce((result, current, index) => {
						if (current.member.id === player.member.id) return result;

						const playerLine = `${numberEmojis[index]} ${current.member.displayName}`;

						return result === "" ? playerLine : `${result}\n${playerLine}`;
					}, ""),
				},
			],
		});
	}

	async handleReaction(reaction: Discord.MessageReaction, user: Discord.User) {
		const playerIndex = numberEmojis.indexOf(reaction.emoji.name);
		const centerIndex = centerEmojis.indexOf(reaction.emoji.name);

		const player = this.players.current.find(
			(p, i) => p.member.id === user.id && i !== playerIndex
		);

		if (!player) return;

		if (this.gameState.current === "VOTING") {
			if (playerIndex === -1 || player.killing !== null) return;

			this.players.set(curr =>
				curr.map(p =>
					p.member.id === user.id ? { ...p, killing: playerIndex } : p
				)
			);

			await this.refreshEmbed();
		} else if (this.gameState.current === "NIGHT") {
			switch (player.initialRole) {
				case "seer": {
					if (playerIndex === -1 && centerIndex === -1) break;

					const action: SeerAction =
						player.action !== null
							? { ...(player.action as SeerAction) }
							: { player: null, center: [null, null] };

					if (playerIndex !== -1) {
						if (action.player !== null || action.center.some(x => x !== null))
							break;

						action.player = playerIndex;
					} else if (centerIndex !== -1) {
						if (action.player !== null) break;

						const nullIndex = action.center.indexOf(null);

						if (nullIndex === -1) break;

						if (nullIndex !== 0 && action.center[0] === centerIndex) break;

						action.center[nullIndex] = centerIndex;
					}

					this.players.set(curr =>
						curr.map<Player>(p =>
							p.member.id === player.member.id ? { ...p, action } : p
						)
					);

					break;
				}
				case "robber": {
					if (playerIndex === -1) break;

					if (player.action !== null) break;

					const target = this.players.current[playerIndex];

					this.players.set(curr =>
						curr.map<Player>(p => {
							if (p.member.id === player.member.id) {
								return {
									...p,
									role: target.role,
									action: { player: playerIndex } as RobberAction,
								};
							} else if (p.member.id === target.member.id) {
								return {
									...p,
									role: player.role,
								};
							} else {
								return p;
							}
						})
					);

					break;
				}
				case "troublemaker": {
					if (playerIndex === -1) break;

					const action: TroublemakerAction =
						player.action !== null
							? { ...(player.action as TroublemakerAction) }
							: { first: null, second: null };

					if (action.first === null) {
						action.first = playerIndex;

						this.players.set(curr =>
							curr.map<Player>(p =>
								p.member.id === player.member.id ? { ...p, action } : p
							)
						);
					} else if (action.second === null) {
						if (action.first === playerIndex) break;

						action.second = playerIndex;

						const first = this.players.current[action.first];
						const second = this.players.current[action.second];

						this.players.set(curr =>
							curr.map<Player>(p => {
								if (p.member.id === player.member.id) {
									return { ...p, action };
								} else if (p.member.id === first.member.id) {
									return { ...p, role: second.role };
								} else if (p.member.id === second.member.id) {
									return { ...p, role: first.role };
								} else {
									return p;
								}
							})
						);
					}

					break;
				}
				case "drunk": {
					if (centerIndex === -1) break;

					if (player.action !== null) break;

					this.players.set(curr =>
						curr.map<Player>(p =>
							p.member.id === player.member.id
								? {
										...p,
										role: this.centerCards.current[centerIndex],
										action: { center: centerIndex } as DrunkAction,
								  }
								: p
						)
					);

					this.centerCards.set(curr =>
						curr.map((c, i) => (i === centerIndex ? player.role! : c))
					);

					break;
				}
				default:
					break;
			}

			await this.refreshDM(player.initialRole!);
		}
	}
}
