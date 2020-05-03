import Discord from "discord.js";
import { join } from "path";
import { capitalize } from "../../../helpers/capitalize";
import { delay } from "../../../helpers/delay";
import { prefixChannel, prefixRole } from "../../../helpers/prefixString";
import { Character } from "./Character";
import { characters } from "./characters";
import { Embeds } from "./embeds";
import { centerEmojis, numberEmojis } from "./emojis";
import { GameState } from "./GameState";
import { centerCardPosition } from "./helpers/centerCardPosition";
import { findPlayerById } from "./helpers/findPlayerById";
import { Player } from "./Player";
import { Sound } from "./Sounds";
import { WerewolfAudioManager } from "./WerewolfAudioManager";

export class WerewolfManager {
	private textChannel?: Discord.TextChannel;
	private audioManager = new WerewolfAudioManager();
	private playerRole?: Discord.Role;
	private bannedRole?: Discord.Role;

	private embeds = new Embeds(this.audioManager);

	private players: Player[] = [];
	private centerCards: Character[] = [];

	private gameState: GameState = GameState.NOT_PLAYING;

	private gameMessage?: Discord.Message;

	private gameTimer = 300;
	private remainingTime = 0;
	private roleTimer = 10;

	isReady() {
		return this.textChannel && this.audioManager.isReady() && this.playerRole;
	}

	isPlaying() {
		return (
			this.gameState !== GameState.NOT_PLAYING &&
			this.gameState !== GameState.PREPARATION
		);
	}

	get currentState() {
		return this.gameState;
	}

	isMaster(id: string) {
		return !!findPlayerById(this.players, id)?.master;
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

		for (const [name, character] of characters) {
			if (character.emoji) continue;

			const emoji = guild.emojis.cache.find(e => e.name === name);

			if (!emoji) {
				throw new Error(`Missing emoji for character "${name}"!`);
			}

			character.emoji = emoji;
		}
	}

	async join(member: Discord.GuildMember) {
		if (findPlayerById(this.players, member.id)) return;

		if (
			member.roles.cache.find(
				role => role.name === prefixRole("werewolf banned")
			)
		)
			return;

		const player = new Player(member);

		if (this.players.length === 0) {
			await this.audioManager.join();

			player.master = true;
		}

		this.players.push(player);

		await member.roles.add(this.playerRole!);

		await this.refreshEmbed();
	}

	async leave(memberId: string, kick: boolean = false, ban: boolean = false) {
		const player = findPlayerById(this.players, memberId);

		if (!player) return;

		this.players.splice(this.players.indexOf(player), 1);

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

		if (this.players.length <= 0) {
			this.audioManager.leave();
		} else if (player.master) {
			this.randomMaster();
		}

		await this.refreshEmbed();
	}

	async newGame() {
		if (!this.textChannel) return;

		if (this.gameState !== GameState.NOT_PLAYING) return;

		this.gameMessage = await this.textChannel.send(
			this.embeds.preparation(
				this.players,
				this.gameTimer,
				this.roleTimer,
				this.audioManager.expert
			)
		);

		this.gameState = GameState.PREPARATION;
	}

	async manageCharacter(character: Character, add: boolean) {
		characters.get(character)!.manageAmount(add ? 1 : -1);

		await this.refreshEmbed();
	}

	async start(forcedRoles?: Character[]) {
		if (this.gameState !== GameState.PREPARATION) return;

		let charactersAmount = 0;
		for (const character of characters.values()) {
			charactersAmount += character.amount;
		}

		const playersAmount = this.players.length;

		if (playersAmount < 3 || playersAmount > 10) return;

		if (charactersAmount !== playersAmount + 3) return;

		await this.assignRoles(forcedRoles);

		await this.night();

		await this.day();

		await this.voting();

		await this.finish();

		this.cleanUp();
	}

	async cancel() {
		if (this.gameState !== GameState.DAY) return;

		this.gameState = GameState.NOT_PLAYING;

		if (this.gameMessage) {
			await this.gameMessage.delete();
		}

		this.cleanUp();
	}

	private async assignRoles(forcedRoles: Character[] = []) {
		if (this.gameState !== GameState.PREPARATION) return;

		this.gameState = GameState.ROLE_ASSIGNING;

		const roles: Character[] = [];
		for (const [name, character] of characters) {
			roles.push(...new Array<Character>(character.amount).fill(name));
		}

		this.players.forEach((player, i) => {
			const index =
				i < forcedRoles.length && roles.includes(forcedRoles[i])
					? roles.indexOf(forcedRoles[i])
					: Math.floor(Math.random() * roles.length);

			const [role] = roles.splice(index, 1);

			player.setRole(role);
		});

		this.centerCards = roles;

		await this.refreshEmbed();

		const messages = await Promise.all(
			this.players.map(player => player.member.send(this.embeds.role(player)))
		);

		await delay(this.roleTimer * 1000);

		await Promise.all(messages.map(message => message.delete()));
	}

	private async night() {
		if (this.gameState !== GameState.ROLE_ASSIGNING) return;

		this.gameState = GameState.NIGHT;

		await this.refreshEmbed();

		await Promise.all([
			this.audioManager.playSound("everyone", Sound.CLOSE),
			this.muteAll(true),
		]);

		for (const character of characters.values()) {
			if (character.nightAction) {
				await character.handleNightAction(
					this.players,
					this.centerCards,
					this.roleTimer * 1000,
					this.audioManager.playSound,
					this.embeds.base
				);
			}
		}

		await delay(2000);
	}

	private async day() {
		if (this.gameState !== GameState.NIGHT) return;

		this.gameState = GameState.DAY;

		this.remainingTime = this.gameTimer;

		await Promise.all([
			this.audioManager.playSound("everyone", Sound.WAKE),
			this.refreshEmbed(),
			this.muteAll(false),
			new Promise(async (resolve, reject) => {
				try {
					for (const character of characters.values()) {
						if (character.amount <= 0 || !character.emoji) continue;

						await this.gameMessage?.react(character.emoji);
					}

					resolve();
				} catch (error) {
					reject(error);
				}
			}),
		]);

		await Promise.race([delay(this.gameTimer * 1000), this.dayTimer()]);

		await this.gameMessage?.reactions.removeAll();
	}

	private async voting() {
		if (this.gameState !== GameState.DAY) return;

		this.gameState = GameState.VOTING;

		await Promise.all([
			this.audioManager.playSound("everyone", Sound.TIMEISUP),
			this.refreshEmbed(),
			new Promise(async (resolve, reject) => {
				try {
					for (let i = 0; i < this.players.length; i++) {
						await this.gameMessage?.react(numberEmojis[i]);
					}

					resolve();
				} catch (error) {
					reject(error);
				}
			}),
		]);

		await delay(this.roleTimer * 1000);
	}

	private async finish() {
		if (this.gameState !== GameState.VOTING) return;

		this.gameState = GameState.NOT_PLAYING;

		if (!this.gameMessage) return;

		const votes = this.players.reduce<{ [player: string]: number }>(
			(result, player, index, array) => {
				const target = player.killing
					? findPlayerById(this.players, player.killing)!
					: this.players[(index + 1) % array.length];

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

		const killed = findPlayerById(this.players, killedId)!;

		const fields: Discord.EmbedFieldData[] = [];

		const doppelganger = this.players.find(
			p => p.role === Character.DOPPELGANGER
		) as Player<Character.DOPPELGANGER>;
		if (doppelganger?.action?.role?.action) {
			switch (doppelganger.action.role.character) {
				case Character.SEER: {
					const seer = doppelganger as Player<
						Character.DOPPELGANGER,
						Character.SEER
					>;
					const originalSeer = findPlayerById(
						this.players,
						seer.action.player
					)!;

					if (seer.action.role.action.player) {
						const target = findPlayerById(
							this.players,
							seer.action.role.action.player
						)!;

						fields.push({
							name: `${seer.member.displayName} (Doppelganger-Seer from ${originalSeer.member.displayName})`,
							value: `Viewed the role of ${target.member.displayName}.`,
						});
					} else if (
						seer.action.role.action.first &&
						seer.action.role.action.second
					) {
						fields.push({
							name: `${seer.member.displayName} (Doppelganger-Seer from ${originalSeer.member.displayName})`,
							value: `Viewed the roles at the ${centerCardPosition(
								seer.action.role.action.first
							)} and at the ${centerCardPosition(
								seer.action.role.action.second
							)}.`,
						});
					}

					break;
				}
				case Character.ROBBER: {
					const robber = doppelganger as Player<
						Character.DOPPELGANGER,
						Character.ROBBER
					>;
					const originalRobber = findPlayerById(
						this.players,
						robber.action.player
					)!;

					if (robber.action.role.action.player) {
						const target = findPlayerById(
							this.players,
							robber.action.role.action.player
						)!;

						fields.push({
							name: `${robber.member.displayName} (Doppelganger-Robber from ${originalRobber.member.displayName})`,
							value: `Stole the role from ${target.member.displayName}.`,
						});
					}

					break;
				}
				case Character.TROUBLEMAKER: {
					const troublemaker = doppelganger as Player<
						Character.DOPPELGANGER,
						Character.TROUBLEMAKER
					>;
					const originalTroublemaker = findPlayerById(
						this.players,
						troublemaker.action.player
					)!;

					if (
						troublemaker.action.role.action.first &&
						troublemaker.action.role.action.second
					) {
						const first = this.players.find(
							p => p.member.id === troublemaker.action.role.action.first
						)!;
						const second = this.players.find(
							p => p.member.id === troublemaker.action.role.action.second
						)!;

						fields.push({
							name: `${troublemaker.member.displayName} (Doppelganger-Troublemaker from ${originalTroublemaker.member.displayName})`,
							value: `Swapped the roles of ${first.member.displayName} and ${second.member.displayName}.`,
						});
					}

					break;
				}
				case Character.DRUNK: {
					const drunk = doppelganger as Player<
						Character.DOPPELGANGER,
						Character.DRUNK
					>;
					const originalDrunk = findPlayerById(
						this.players,
						drunk.action.player
					)!;

					if (drunk.action.role.action.center) {
						fields.push({
							name: `${drunk.member.displayName} (Doppelganger-Drunk from ${originalDrunk.member.displayName})`,
							value: `Took the role from the center at the ${centerCardPosition(
								drunk.action.role.action.center
							)}.`,
						});
					}

					break;
				}
				default:
					break;
			}
		} else if (doppelganger?.action?.role?.character) {
			const originalRoleHolder = findPlayerById(
				this.players,
				doppelganger.action.player
			)!;

			const role = capitalize(doppelganger.action.role.character);

			fields.push({
				name: `${doppelganger.member.displayName} (Doppelganger-${role})`,
				value: `Became ${role} from ${originalRoleHolder.member.displayName}.`,
			});
		}

		const seer = this.players.find(p => p.role === Character.SEER) as Player<
			Character.SEER
		>;
		if (seer?.action) {
			if (seer.action.player) {
				const target = findPlayerById(this.players, seer.action.player)!;

				fields.push({
					name: `${seer.member.displayName} (Seer)`,
					value: `Viewed the role of ${target.member.displayName}.`,
				});
			} else if (seer.action.first && seer.action.second) {
				fields.push({
					name: `${seer.member.displayName} (Seer)`,
					value: `Viewed the roles at the ${centerCardPosition(
						seer.action.first
					)} and at the ${centerCardPosition(seer.action.second)}.`,
				});
			}
		}

		const robber = this.players.find(
			p => p.role === Character.ROBBER
		) as Player<Character.ROBBER>;
		if (robber?.action) {
			const target = findPlayerById(this.players, robber.action.player)!;

			fields.push({
				name: `${robber.member.displayName} (Robber)`,
				value: `Stole the role from ${target.member.displayName}.`,
			});
		}

		const troublemaker = this.players.find(
			p => p.role === Character.TROUBLEMAKER
		) as Player<Character.TROUBLEMAKER>;
		if (troublemaker?.action?.first && troublemaker?.action?.second) {
			const first = this.players.find(
				p => p.member.id === troublemaker.action.first
			)!;
			const second = this.players.find(
				p => p.member.id === troublemaker.action.second
			)!;

			fields.push({
				name: `${troublemaker.member.displayName} (Troublemaker)`,
				value: `Swapped the roles of ${first.member.displayName} and ${second.member.displayName}.`,
			});
		}

		const drunk = this.players.find(p => p.role === Character.DRUNK) as Player<
			Character.DRUNK
		>;
		if (drunk?.action) {
			fields.push({
				name: `${drunk.member.displayName} (Drunk)`,
				value: `Took the role from the center at the ${centerCardPosition(
					drunk.action.center
				)}.`,
			});
		}

		fields.push({
			name: "Final roles",
			value: this.players.reduce((result, current, index) => {
				const role =
					current.role !== current.currentRole
						? `${current.role} -> ${current.currentRole}`
						: current.currentRole;
				const playerLine = `${numberEmojis[index]} ${current.member.displayName}: ${role}`;

				return result === "" ? playerLine : `${result}\n${playerLine}`;
			}, ""),
		});

		fields.push({
			name: "Center roles",
			value: `${centerEmojis[0]} ${this.centerCards[0]}\n${centerEmojis[1]} ${this.centerCards[1]}\n${centerEmojis[2]} ${this.centerCards[2]}`,
		});

		await this.gameMessage.edit(
			this.embeds.base({
				footer: {},
				timestamp: Date.now(),
				title: `${killed.member.displayName} was killed with ${killedVotes} votes!`,
				description: this.players.reduce((result, current, index, array) => {
					const target = current.killing
						? findPlayerById(this.players, current.killing)!
						: this.players[(index + 1) % array.length];

					const playerLine = `${numberEmojis[index]} ${current.member.displayName} voted ${target.member.displayName}.`;

					return result === "No votes happened"
						? playerLine
						: `${result}\n${playerLine}`;
				}, "No votes happened"),
				thumbnail: {
					url: characters.get(killed.currentRole)!.image,
				},
				fields,
			})
		);

		delete this.gameMessage;
	}

	private cleanUp() {
		for (const player of this.players) {
			player.clear();
		}

		this.centerCards = [];
	}

	dayTimer() {
		return new Promise(async (resolve, reject) => {
			try {
				while (this.gameState === GameState.DAY) {
					await delay(5000);

					this.remainingTime -= 5;

					this.refreshEmbed().catch(reject);
				}

				resolve();
			} catch (error) {
				reject(error);
			}
		});
	}

	async rules(character: Character) {
		await this.audioManager.playSound(character, Sound.NAME);
		await this.audioManager.playSound(character, Sound.RULES);
	}

	private async muteAll(on: boolean) {
		await Promise.all(
			this.players.map(player => {
				if (
					!this.audioManager.isUserInVoiceChannel(
						player.member.voice.channelID!
					)
				)
					return;

				return player.member.voice.setMute(on);
			})
		);
	}

	async setMaster(memberId: string) {
		const nextMaster = findPlayerById(this.players, memberId);

		if (!nextMaster) return;

		const previousMaster = this.players.find(p => p.master);

		if (previousMaster) {
			previousMaster.master = false;
		}
		nextMaster.master = true;

		await this.refreshEmbed();
	}

	private randomMaster() {
		const randomIndex = Math.floor(Math.random() * this.players.length);

		this.players[randomIndex].master = true;
	}

	async toggleExpert() {
		this.audioManager.toggleExpert();

		await this.refreshEmbed();
	}

	async changeTimer(timer: "game" | "role", seconds: number) {
		if (timer === "game") {
			this.gameTimer = seconds > 0 ? seconds : 0;
		} else if (timer === "role") {
			this.roleTimer = seconds > 0 ? seconds : 0;
		}

		await this.refreshEmbed();
	}

	async changeVolume(volume: number) {
		this.audioManager.setVolume(volume);

		await this.refreshEmbed();
	}

	async mangageEmojis(guild: Discord.Guild, add: boolean) {
		for (const [name, character] of characters) {
			let emoji = guild.emojis.cache.find(e => e.name === name);

			if (add) {
				if (!emoji) {
					const path = join(
						__dirname,
						`../../../../assets/werewolf/images/icons/${name}.png`
					);

					emoji = await guild.emojis.create(path, name);
				}

				character.emoji = emoji;
			} else if (!add) {
				if (emoji) {
					await emoji.delete();
				}

				delete character.emoji;
			}
		}
	}

	private async refreshEmbed() {
		if (!this.gameMessage) return;

		switch (this.gameState) {
			case GameState.NOT_PLAYING:
				break;
			case GameState.PREPARATION:
				await this.gameMessage.edit(
					this.embeds.preparation(
						this.players,
						this.gameTimer,
						this.roleTimer,
						this.audioManager.expert
					)
				);
				break;
			case GameState.ROLE_ASSIGNING:
				await this.gameMessage.edit(this.embeds.roleAssigning());
				break;
			case GameState.NIGHT:
				await this.gameMessage.edit(this.embeds.night());
				break;
			case GameState.DAY:
				await this.gameMessage.edit(
					this.embeds.day(this.players, this.remainingTime)
				);
				break;
			case GameState.VOTING:
				await this.gameMessage.edit(this.embeds.voting(this.players));
				break;
			default:
				throw new Error("Unhandled game state.");
		}
	}

	async handleReaction(reaction: Discord.MessageReaction, user: Discord.User) {
		const playerIndex = numberEmojis.indexOf(reaction.emoji.name);
		const centerIndex = centerEmojis.indexOf(reaction.emoji.name);
		const characterFromEmoji = characters.get(reaction.emoji.name as any);

		if (playerIndex === -1 && centerIndex === -1 && !characterFromEmoji) return;

		const player = this.players.find(
			(p, i) => p.member.id === user.id && i !== playerIndex
		);

		if (!player) return;

		const target = this.players[playerIndex];

		if (playerIndex !== -1 && !target) return;

		if (this.gameState === GameState.NIGHT) {
			characters
				.get(player.role)!
				.handleReaction(
					player,
					target,
					this.players,
					this.centerCards,
					{ playerIndex, centerIndex },
					this.embeds.base
				);
		} else if (this.gameState === GameState.DAY) {
			if (!characterFromEmoji) return;

			player.claimedRole = characterFromEmoji.name;

			await this.refreshEmbed();
		} else if (this.gameState === GameState.VOTING) {
			if (playerIndex === -1 || player.killing) return;

			player.killing = target.member.id;

			await this.refreshEmbed();
		}
	}
}
