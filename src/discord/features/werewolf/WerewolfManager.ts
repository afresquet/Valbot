import Discord from "discord.js";
import { join } from "path";
import { clamp } from "../../../helpers/clamp";
import { delay } from "../../../helpers/delay";
import { prefixChannel, prefixRole } from "../../../helpers/prefixString";
import { State } from "../../../helpers/State";
import { characters } from "./characters";
import { Embeds } from "./embeds";
import { centerEmojis, numberEmojis } from "./emojis";
import { centerCardPosition } from "./helpers/centerCardPosition";
import {
	Character,
	Characters,
	CharactersState,
	GameState,
	NightActionCharacter,
	NightActionCharacters,
	Player,
} from "./types";
import { WerewolfAudioManager } from "./WerewolfAudioManager";

export class WerewolfManager {
	private textChannel: Discord.TextChannel | null = null;
	private audioManager = new WerewolfAudioManager();
	private playerRole: Discord.Role | null = null;
	private bannedRole: Discord.Role | null = null;

	private embeds = new Embeds(this.audioManager);

	private players = new State<Player[]>([]);
	private centerCards = new State<Character[]>([]);

	private gameState = new State<GameState>("NOT_PLAYING");
	private gameMessage: Discord.Message | null = null;
	private nightActionDM: Discord.Message | null = null;

	private expert = new State(false);

	private gameTimer = new State(300);
	private roleTimer = new State(10);

	private characters = new State<CharactersState>(
		Characters.map(character => ({ character, amount: 0 }))
	);

	private soundPath(sound: string) {
		return join(__dirname, `../../../../assets/werewolf/sounds/${sound}.mp3`);
	}

	isReady() {
		return (
			this.textChannel !== null &&
			this.audioManager.isReady() &&
			this.playerRole !== null
		);
	}

	isPlaying() {
		return (
			this.gameState.current !== "NOT_PLAYING" &&
			this.gameState.current !== "PREPARATION"
		);
	}

	findPlayerById(id: string) {
		return this.players.current.find(player => player.member.id === id);
	}

	isMaster(id: string) {
		return !!this.findPlayerById(id)?.master;
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

		if (!this.audioManager.isReady())
			this.audioManager.setup(guild, prefixChannel("vc-werewolf"));

		if (!this.playerRole) {
			const playerRoleName = prefixRole("werewolf player");

			const playerRole = guild.roles.cache.find(r => r.name === playerRoleName);

			if (!playerRole) {
				throw new Error(`There's no #${playerRoleName} role!`);
			}

			this.playerRole = playerRole;
		}

		if (!this.bannedRole) {
			const bannedRoleName = prefixRole("werewolf banned");

			const bannedRole = guild.roles.cache.find(r => r.name === bannedRoleName);

			if (!bannedRole) {
				throw new Error(`There's no #${bannedRoleName} role!`);
			}

			this.bannedRole = bannedRole;
		}
	}

	async join(member: Discord.GuildMember) {
		if (this.findPlayerById(member.id)) return;

		if (
			member.roles.cache.find(
				role => role.name === prefixRole("werewolf banned")
			)
		)
			return;

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

		await member.roles.add(this.playerRole!);

		await this.refreshEmbed();
	}

	async leave(memberId: string, kick: boolean = false, ban: boolean = false) {
		const player = this.findPlayerById(memberId);

		if (!player) return;

		this.players.set(curr => curr.filter(p => p.member.id !== memberId));

		await player.member.roles.remove(this.playerRole!);

		if (
			this.audioManager.isUserInVoiceChannel(player.member.voice.channelID!)
		) {
			if (kick || ban) {
				await player.member.voice.kick();
			}

			if (ban) {
				await player.member.roles.add(this.bannedRole!);
			}
		}

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

		this.gameMessage = await this.textChannel.send(
			this.embeds.preparation(
				this.players.current,
				this.characters.current,
				this.gameTimer.current,
				this.roleTimer.current,
				this.expert.current
			)
		);

		this.gameState.set(() => "PREPARATION");
	}

	async manageCharacter(character: Character, add: boolean) {
		// Will remove this when I implement it
		if (character === "doppelganger") return;

		let max = 1;
		if (character === "werewolf" || character === "mason") {
			max = 2;
		} else if (character === "villager") {
			max = 3;
		}

		this.characters.set(curr =>
			curr.map(c =>
				c.character === character
					? { ...c, amount: clamp(c.amount + (add ? 1 : -1), 0, max) }
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

	cancel() {
		if (this.gameState.current !== "DAY") return;

		this.gameState.set(() => "NOT_PLAYING");

		this.cleanUp();
	}

	private async assignRoles() {
		if (this.gameState.current !== "PREPARATION") return;

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
				player.member.send(this.embeds.role(player))
			)
		);

		await delay(this.roleTimer.current * 1000);

		await Promise.all(messages.map(message => message.delete()));
	}

	private async night() {
		if (this.gameState.current !== "ROLE_ASSIGNING") return;

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
		if (this.gameState.current !== "NIGHT") return;

		this.gameState.set(() => "DAY");

		this.refreshEmbed();

		await this.audioManager.play(
			this.soundPath(characters.everyone.sounds.wake)
		);

		await this.muteAll(false);

		await delay(this.gameTimer.current * 1000);
	}

	private async voting() {
		if (this.gameState.current !== "DAY") return;

		this.gameState.set(() => "VOTING");

		await this.audioManager.play(
			this.soundPath(characters.everyone.sounds.timeisup)
		);

		const messages = await Promise.all(
			this.players.current.map(async (player, index, array) => {
				const message = await player.member.send(
					this.embeds.playerVoting(this.players.current, player)
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
		if (this.gameState.current !== "VOTING") return;

		this.gameState.set(() => "NOT_PLAYING");

		if (!this.gameMessage) return;

		const players = this.players.current;

		const votes = players.reduce<{ [player: string]: number }>(
			(result, player, index, array) => {
				const target = player.killing
					? this.findPlayerById(player.killing)!
					: players[(index + 1) % array.length];

				const id = target.member.id;

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

		const killed = this.findPlayerById(killedId)!;

		const fields: Discord.EmbedFieldData[] = [];

		const seer = players.find(p => p.initialRole === "seer") as Player<"seer">;
		if (seer && seer.action !== null) {
			if (seer.action.player !== null) {
				const player = this.findPlayerById(seer.action.player)!;

				fields.push({
					name: `${seer.member.displayName} (Seer)`,
					value: `Viewed the role of ${player.member.displayName}.`,
				});
			} else if (seer.action.first !== null && seer.action.second !== null) {
				fields.push({
					name: `${seer.member.displayName} (Seer)`,
					value: `Viewed the roles at the ${centerCardPosition(
						seer.action.first!
					)} and at the ${centerCardPosition(seer.action.second!)}.`,
				});
			}
		}

		const robber = players.find(p => p.initialRole === "robber") as Player<
			"robber"
		>;
		if (robber && robber.action !== null) {
			const player = this.findPlayerById(robber.action.player)!;

			fields.push({
				name: `${robber.member.displayName} (Robber)`,
				value: `Stole the role from ${player.member.displayName}.`,
			});
		}

		const troublemaker = players.find(
			p => p.initialRole === "troublemaker"
		) as Player<"troublemaker">;
		if (
			troublemaker &&
			troublemaker.action !== null &&
			troublemaker.action.first !== null &&
			troublemaker.action.second !== null
		) {
			const first = players.find(
				p => p.member.id === troublemaker.action.first
			)!;
			const second = players.find(
				p => p.member.id === troublemaker.action.second
			)!;

			fields.push({
				name: `${troublemaker.member.displayName} (Troublemaker)`,
				value: `Swapped the roles of ${first.member.displayName} and ${second.member.displayName}.`,
			});
		}

		const drunk = players.find(p => p.initialRole === "drunk") as Player<
			"drunk"
		>;
		if (drunk && drunk.action !== null) {
			fields.push({
				name: `${drunk.member.displayName} (Drunk)`,
				value: `Took the role from the center at the ${centerCardPosition(
					drunk.action.center
				)}.`,
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

		const centerCards = this.centerCards.current;

		fields.push({
			name: "Center roles",
			value: `${centerEmojis[0]} ${centerCards[0]}\n${centerEmojis[1]} ${centerCards[1]}\n${centerEmojis[2]} ${centerCards[2]}`,
		});

		await this.gameMessage.edit(
			this.embeds.base({
				footer: {},
				timestamp: Date.now(),
				title: `${killed.member.displayName} was killed with ${killedVotes} votes!`,
				description: players.reduce((result, current, index, array) => {
					const target = current.killing
						? this.findPlayerById(current.killing)!
						: players[(index + 1) % array.length];

					const playerLine = `${numberEmojis[index]} ${current.member.displayName} voted ${target.member.displayName}.`;

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
		if (!this.findPlayerById(memberId)) return;

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
					player.member.send(
						this.embeds.nightActionDM(this.players.current, player)
					)
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
			this.embeds.nightActionDM(this.players.current, player)
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
				await this.gameMessage.edit(
					this.embeds.preparation(
						this.players.current,
						this.characters.current,
						this.gameTimer.current,
						this.roleTimer.current,
						this.expert.current
					)
				);
				break;
			case "ROLE_ASSIGNING":
				await this.gameMessage.edit(this.embeds.roleAssigning());
				break;
			case "NIGHT":
				await this.gameMessage.edit(this.embeds.night());
				break;
			case "DAY":
				await this.gameMessage.edit(this.embeds.day());
				break;
			case "VOTING":
				await this.gameMessage.edit(this.embeds.voting(this.players.current));
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

		await this.nightActionDM.edit(
			this.embeds.nightActionDM(
				this.players.current,
				player,
				this.centerCards.current
			)
		);
	}

	async handleReaction(reaction: Discord.MessageReaction, user: Discord.User) {
		const playerIndex = numberEmojis.indexOf(reaction.emoji.name);
		const centerIndex = centerEmojis.indexOf(reaction.emoji.name);

		if (playerIndex === -1 && centerIndex === -1) return;

		const player = this.players.current.find(
			(p, i) => p.member.id === user.id && i !== playerIndex
		);

		if (!player) return;

		const target = this.players.current[playerIndex];

		if (playerIndex !== -1 && !target) return;

		if (this.gameState.current === "VOTING") {
			if (playerIndex === -1 || player.killing !== null) return;

			const target = this.players.current[playerIndex];

			this.players.set(curr =>
				curr.map(p =>
					p.member.id === user.id ? { ...p, killing: target.member.id } : p
				)
			);

			await this.refreshEmbed();
		} else if (this.gameState.current === "NIGHT") {
			switch (player.initialRole) {
				case "seer": {
					const seer = player as Player<"seer">;

					const action: typeof seer.action =
						seer.action !== null
							? { ...seer.action }
							: { player: null, first: null, second: null };

					if (playerIndex !== -1) {
						if (
							action.player !== null ||
							action.first !== null ||
							action.second !== null
						)
							break;

						action.player = target.member.id;
					} else if (centerIndex !== -1) {
						if (action.player !== null) break;

						if (action.first === null) {
							action.first = centerIndex;
						} else if (
							action.first !== null &&
							action.first !== centerIndex &&
							action.second === null
						) {
							action.second = centerIndex;
						} else {
							break;
						}
					}

					this.players.set(curr =>
						curr.map<Player>(p =>
							p.member.id === seer.member.id ? { ...p, action } : p
						)
					);

					break;
				}
				case "robber": {
					if (playerIndex === -1) break;

					const robber = player as Player<"robber">;

					if (robber.action !== null) break;

					const action: typeof robber.action = { player: target.member.id };

					this.players.set(curr =>
						curr.map<Player>(p => {
							if (p.member.id === robber.member.id) {
								return { ...p, role: target.role, action };
							} else if (p.member.id === target.member.id) {
								return { ...p, role: robber.role };
							} else {
								return p;
							}
						})
					);

					break;
				}
				case "troublemaker": {
					if (playerIndex === -1) break;

					const troublemaker = player as Player<"troublemaker">;

					const action: typeof troublemaker.action =
						troublemaker.action !== null
							? { ...troublemaker.action }
							: { first: null, second: null };

					if (action.first === null) {
						action.first = target.member.id;

						this.players.set(curr =>
							curr.map<Player>(p =>
								p.member.id === troublemaker.member.id ? { ...p, action } : p
							)
						);
					} else if (action.second === null) {
						if (action.first === target.member.id) break;

						const first = this.findPlayerById(action.first)!;
						const second = target;

						action.second = second.member.id;

						this.players.set(curr =>
							curr.map<Player>(p => {
								if (p.member.id === troublemaker.member.id) {
									return { ...p, action };
								} else if (p.member.id === action.first) {
									return { ...p, role: second.role };
								} else if (p.member.id === action.second) {
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

					const drunk = player as Player<"drunk">;

					if (drunk.action !== null) break;

					const action: typeof drunk.action = { center: centerIndex };

					this.players.set(curr =>
						curr.map<Player>(p =>
							p.member.id === drunk.member.id
								? { ...p, role: this.centerCards.current[centerIndex], action }
								: p
						)
					);

					this.centerCards.set(curr =>
						curr.map((c, i) => (i === centerIndex ? drunk.role! : c))
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
