import Discord from "discord.js";
import { join } from "path";
import { capitalize } from "../../../helpers/capitalize";
import { clamp } from "../../../helpers/clamp";
import { delay } from "../../../helpers/delay";
import { prefixChannel, prefixRole } from "../../../helpers/prefixString";
import { characters } from "./characters";
import { Embeds } from "./embeds";
import { centerEmojis, numberEmojis } from "./emojis";
import { centerCardPosition } from "./helpers/centerCardPosition";
import {
	Character,
	CharacterCount,
	Characters,
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

	private players: Player[] = [];
	private centerCards: Character[] = [];

	private gameState: GameState = GameState.NOT_PLAYING;

	private gameMessage: Discord.Message | null = null;
	private nightActionDM: Discord.Message | null = null;

	private expert = false;

	private gameTimer = 300;
	private roleTimer = 10;

	private characters = Characters.map<CharacterCount>(character => ({
		character,
		amount: 0,
	}));

	private soundPath(sound: string) {
		return join(__dirname, `../../../../assets/werewolf/sounds/${sound}.mp3`);
	}

	isReady() {
		return this.textChannel && this.audioManager.isReady() && this.playerRole;
	}

	isPlaying() {
		return (
			this.gameState !== GameState.NOT_PLAYING &&
			this.gameState !== GameState.PREPARATION
		);
	}

	findPlayerById(id: string) {
		return this.players.find(player => player.member.id === id);
	}

	isMaster(id: string) {
		return !!this.findPlayerById(id)?.master;
	}

	private isDoppelganger(player: Player) {
		return player.initialRole === Character.DOPPELGANGER;
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

		if (this.players.length === 0) {
			await this.audioManager.join();

			player.master = true;
		}

		this.players.push(player);

		await member.roles.add(this.playerRole!);

		await this.refreshEmbed();
	}

	async leave(memberId: string, kick: boolean = false, ban: boolean = false) {
		const player = this.findPlayerById(memberId);

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
				this.characters,
				this.gameTimer,
				this.roleTimer,
				this.expert
			)
		);

		this.gameState = GameState.PREPARATION;
	}

	async manageCharacter(character: Character, add: boolean) {
		let max = 1;
		if (character === Character.WEREWOLF || character === Character.MASON) {
			max = 2;
		} else if (character === Character.VILLAGER) {
			max = 3;
		}

		this.characters = this.characters.map(c =>
			c.character === character
				? { ...c, amount: clamp(c.amount + (add ? 1 : -1), 0, max) }
				: c
		);

		await this.refreshEmbed();
	}

	async start(forcedRoles?: Character[]) {
		if (this.gameState !== GameState.PREPARATION) return;

		const charactersAmount = this.characters.reduce(
			(result, current) => result + current.amount,
			0
		);
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

		const roles = this.characters.reduce<Character[]>(
			(result, current) => [
				...result,
				...new Array(current.amount).fill(current.character),
			],
			[]
		);

		this.players = this.players.map((player, i) => {
			const index =
				i < forcedRoles.length && roles.includes(forcedRoles[i])
					? roles.indexOf(forcedRoles[i])
					: Math.floor(Math.random() * roles.length);

			const [role] = roles.splice(index, 1);

			return { ...player, initialRole: role, role };
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
			this.audioManager.play(this.soundPath(characters.everyone.sounds.close)),
			this.muteAll(true),
		]);

		for (const character of NightActionCharacters) {
			await this.playCharacter(character);
		}

		await delay(2000);
	}

	private async day() {
		if (this.gameState !== GameState.NIGHT) return;

		this.gameState = GameState.DAY;

		this.refreshEmbed();

		await this.audioManager.play(
			this.soundPath(characters.everyone.sounds.wake)
		);

		await this.muteAll(false);

		await delay(this.gameTimer * 1000);
	}

	private async voting() {
		if (this.gameState !== GameState.DAY) return;

		this.gameState = GameState.VOTING;

		await this.audioManager.play(
			this.soundPath(characters.everyone.sounds.timeisup)
		);

		const messages = await Promise.all(
			this.players.map(async (player, index, array) => {
				const message = await player.member.send(
					this.embeds.playerVoting(this.players, player)
				);

				for (let i = 0; i < array.length; i++) {
					if (i === index) continue;

					await message.react(numberEmojis[i]);
				}

				return message;
			})
		);

		await this.refreshEmbed();

		await delay(this.roleTimer * 1000);

		await Promise.all(messages.map(message => message.delete()));
	}

	private async finish() {
		if (this.gameState !== GameState.VOTING) return;

		this.gameState = GameState.NOT_PLAYING;

		if (!this.gameMessage) return;

		const votes = this.players.reduce<{ [player: string]: number }>(
			(result, player, index, array) => {
				const target = player.killing
					? this.findPlayerById(player.killing)!
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

		const killed = this.findPlayerById(killedId)!;

		const fields: Discord.EmbedFieldData[] = [];

		const doppelganger = this.players.find(
			p => p.initialRole === Character.DOPPELGANGER
		) as Player<Character.DOPPELGANGER>;
		if (doppelganger?.action?.role?.action) {
			switch (doppelganger.action.role.character) {
				case Character.SEER: {
					const seer = doppelganger as Player<
						Character.DOPPELGANGER,
						Character.SEER
					>;
					const originalSeer = this.findPlayerById(seer.action.player)!;

					if (seer.action.role.action.player) {
						const target = this.findPlayerById(seer.action.role.action.player)!;

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
					const originalRobber = this.findPlayerById(robber.action.player)!;

					if (robber.action.role.action.player) {
						const target = this.findPlayerById(
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
					const originalTroublemaker = this.findPlayerById(
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
					const originalDrunk = this.findPlayerById(drunk.action.player)!;

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
			const originalRoleHolder = this.findPlayerById(
				doppelganger.action.player
			)!;

			const role = capitalize(doppelganger.action.role.character);

			fields.push({
				name: `${doppelganger.member.displayName} (Doppelganger-${role})`,
				value: `Became ${role} from ${originalRoleHolder.member.displayName}.`,
			});
		}

		const seer = this.players.find(
			p => p.initialRole === Character.SEER
		) as Player<Character.SEER>;
		if (seer?.action) {
			if (seer.action.player) {
				const target = this.findPlayerById(seer.action.player)!;

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
			p => p.initialRole === Character.ROBBER
		) as Player<Character.ROBBER>;
		if (robber?.action) {
			const target = this.findPlayerById(robber.action.player)!;

			fields.push({
				name: `${robber.member.displayName} (Robber)`,
				value: `Stole the role from ${target.member.displayName}.`,
			});
		}

		const troublemaker = this.players.find(
			p => p.initialRole === Character.TROUBLEMAKER
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

		const drunk = this.players.find(
			p => p.initialRole === Character.DRUNK
		) as Player<Character.DRUNK>;
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
					current.initialRole !== current.role
						? `${current.initialRole} -> ${current.role}`
						: current.role;
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
						? this.findPlayerById(current.killing)!
						: this.players[(index + 1) % array.length];

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
		this.players = this.players.map(player => ({
			...player,
			initialRole: null,
			role: null,
			action: null,
			killing: null,
		}));

		this.centerCards = [];
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
		await Promise.all(
			this.players.map(player => {
				if (
					on &&
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
		if (!this.findPlayerById(memberId)) return;

		this.players = this.players.map(player => ({
			...player,
			master: player.member.id === memberId,
		}));

		await this.refreshEmbed();
	}

	private randomMaster() {
		const randomIndex = Math.floor(Math.random() * this.players.length);

		this.players[randomIndex].master = true;
	}

	async toggleExpert() {
		this.expert = !this.expert;

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

	private async playCharacter(character: NightActionCharacter) {
		if (this.characters.find(c => c.character === character)!.amount <= 0)
			return;

		await this.audioManager.play(
			this.soundPath(
				this.expert
					? characters[character].sounds.expert.wake
					: characters[character].sounds.wake
			)
		);

		await this.handleNightActionCharacter(character);

		if (character === Character.DOPPELGANGER) {
			await this.handleDoppelgangerNightAction();
		}

		if (character === Character.MINION) {
			await this.audioManager.play(
				this.soundPath(characters.minion.sounds.thumb)
			);
		}

		await this.audioManager.play(
			this.soundPath(characters[character].sounds.close)
		);

		if (
			character === Character.INSOMNIAC &&
			this.characters.find(c => c.character === Character.DOPPELGANGER)!
				.amount > 0
		) {
			const doppelganger = this.players.find(
				p => p.initialRole === Character.DOPPELGANGER
			)! as Player<Character.DOPPELGANGER, Character.INSOMNIAC>;

			await this.audioManager.play(
				this.soundPath(
					this.expert
						? characters.insomniac.sounds.expert.doppelganger
						: characters.insomniac.sounds.doppelganger
				)
			);

			if (doppelganger?.action?.role?.character === Character.INSOMNIAC) {
				this.nightActionDM = await doppelganger.member.send(
					this.embeds.nightActionDM(
						this.players,
						doppelganger,
						this.centerCards
					)
				);
			}

			await delay(this.roleTimer * 1000);

			await Promise.all([
				this.audioManager.play(
					this.soundPath(characters.doppelganger.sounds.close)
				),
				this.nightActionDM?.delete(),
			]);

			this.nightActionDM = null;
		}
	}

	private async handleNightActionCharacter(character: NightActionCharacter) {
		if ([Character.WEREWOLF, Character.MASON].includes(character)) {
			const players = this.players.filter(
				player =>
					(this.isDoppelganger(player) &&
						(player as Player<Character.DOPPELGANGER>).action.role.character ===
							character) ||
					player.initialRole === character
			);

			const messages = await Promise.all(
				players.map(player =>
					player.member.send(this.embeds.nightActionDM(this.players, player))
				)
			);

			await delay(this.roleTimer * 1000);

			await Promise.all(messages.map(message => message.delete()));

			return;
		}

		const player = this.players.find(
			player => player.initialRole === character
		)!;

		if (!player) {
			await delay(this.roleTimer * 1000);

			return;
		}

		this.nightActionDM = await player.member.send(
			this.embeds.nightActionDM(this.players, player)
		);

		if (
			[
				Character.DOPPELGANGER,
				Character.SEER,
				Character.ROBBER,
				Character.TROUBLEMAKER,
			].includes(character)
		) {
			for (let i = 0; i < this.players.length; i++) {
				if (this.players[i].member.id === player.member.id) continue;

				await this.nightActionDM!.react(numberEmojis[i]);
			}
		}

		if ([Character.SEER, Character.DRUNK].includes(character)) {
			for (let i = 0; i < centerEmojis.length; i++) {
				await this.nightActionDM!.react(centerEmojis[i]);
			}
		}

		await delay(this.roleTimer * 1000);

		await this.nightActionDM.delete();

		this.nightActionDM = null;
	}

	private async handleDoppelgangerNightAction() {
		const doppelganger = this.players.find(
			p => p.initialRole === Character.DOPPELGANGER
		) as Player<Character.DOPPELGANGER>;

		if (doppelganger?.action) {
			doppelganger.action.ready = true;
		}

		if (
			[
				Character.SEER,
				Character.ROBBER,
				Character.TROUBLEMAKER,
				Character.DRUNK,
			].includes(doppelganger?.action?.role?.character)
		) {
			this.nightActionDM = await doppelganger.member.send(
				this.embeds.nightActionDM(this.players, doppelganger, this.centerCards)
			);

			if (
				[
					Character.DOPPELGANGER,
					Character.SEER,
					Character.ROBBER,
					Character.TROUBLEMAKER,
				].includes(doppelganger.action.role.character)
			) {
				for (let i = 0; i < this.players.length; i++) {
					if (this.players[i].member.id === doppelganger.member.id) continue;

					await this.nightActionDM.react(numberEmojis[i]);
				}
			}

			if (
				[Character.SEER, Character.DRUNK].includes(
					doppelganger.action.role.character
				)
			) {
				for (let i = 0; i < centerEmojis.length; i++) {
					await this.nightActionDM.react(centerEmojis[i]);
				}
			}
		}

		await delay(this.roleTimer * 1000);

		if (this.nightActionDM) {
			await this.nightActionDM.delete();

			this.nightActionDM = null;
		}

		// Doppelganger Minion
		if (
			this.characters.find(c => c.character === Character.MINION)!.amount <= 0
		)
			return;

		await this.audioManager.play(
			this.soundPath(
				this.expert
					? characters.minion.sounds.expert.doppelganger
					: characters.minion.sounds.doppelganger
			)
		);

		if (doppelganger?.action?.role?.character === Character.MINION) {
			this.nightActionDM = await doppelganger.member.send(
				this.embeds.nightActionDM(this.players, doppelganger, this.centerCards)
			);
		}

		await delay(this.roleTimer * 1000);

		if (this.nightActionDM) {
			await this.nightActionDM.delete();

			this.nightActionDM = null;
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
						this.characters,
						this.gameTimer,
						this.roleTimer,
						this.expert
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
				await this.gameMessage.edit(this.embeds.day());
				break;
			case GameState.VOTING:
				await this.gameMessage.edit(this.embeds.voting(this.players));
				break;
			default:
				throw new Error("Unhandled game state.");
		}
	}

	private async refreshDM(character: Character) {
		if (!this.nightActionDM || this.gameState !== GameState.NIGHT) return;

		const player = this.players.find(p => p.initialRole === character);

		if (!player) return;

		await this.nightActionDM.edit(
			this.embeds.nightActionDM(this.players, player, this.centerCards)
		);
	}

	async handleReaction(reaction: Discord.MessageReaction, user: Discord.User) {
		const playerIndex = numberEmojis.indexOf(reaction.emoji.name);
		const centerIndex = centerEmojis.indexOf(reaction.emoji.name);

		if (playerIndex === -1 && centerIndex === -1) return;

		const player = this.players.find(
			(p, i) => p.member.id === user.id && i !== playerIndex
		);

		if (!player) return;

		const target = this.players[playerIndex];

		if (playerIndex !== -1 && !target) return;

		if (this.gameState === GameState.NIGHT) {
			const role =
				this.isDoppelganger(player) &&
				(player as Player<Character.DOPPELGANGER>).action?.ready
					? (player as Player<Character.DOPPELGANGER>).action.role.character
					: player.initialRole;

			switch (role) {
				case Character.DOPPELGANGER: {
					const doppelganger = player as Player<Character.DOPPELGANGER>;

					if (playerIndex === -1 || doppelganger.action) break;

					doppelganger.action = {
						player: target.member.id,
						ready: false,
						role: {
							character: target.initialRole!,
							action: null,
						},
					};

					break;
				}
				case Character.SEER: {
					const seer = player as Player<Character.SEER>;
					const doppelgangerSeer = player as Player<
						Character.DOPPELGANGER,
						Character.SEER
					>;

					let action: typeof seer.action = {
						player: null,
						first: null,
						second: null,
					};

					if (
						this.isDoppelganger(player) &&
						doppelgangerSeer.action?.role?.action
					) {
						action = {
							...doppelgangerSeer.action.role.action,
						};
					} else if (player.initialRole === Character.SEER && seer.action) {
						action = { ...seer.action };
					}

					if (playerIndex !== -1) {
						if (action.player || action.first || action.second) break;

						action.player = target.member.id;
					} else if (centerIndex !== -1) {
						if (action.player) break;

						if (!action.first) {
							action.first = centerIndex;
						} else if (action.first !== centerIndex && !action.second) {
							action.second = centerIndex;
						} else {
							break;
						}
					}

					if (this.isDoppelganger(player)) {
						doppelgangerSeer.action.role.action = action;
					} else {
						seer.action = action;
					}

					break;
				}
				case Character.ROBBER: {
					if (playerIndex === -1) break;

					const robber = player as Player<Character.ROBBER>;
					const doppelgangerRobber = player as Player<
						Character.DOPPELGANGER,
						Character.ROBBER
					>;

					if (
						this.isDoppelganger(player)
							? doppelgangerRobber.action?.role?.action
							: robber.action
					)
						break;

					const action: typeof robber.action = { player: target.member.id };

					if (this.isDoppelganger(player)) {
						doppelgangerRobber.action.role.action = action;
					} else {
						robber.action = action;
					}

					[player.role, target.role] = [target.role, player.role];

					break;
				}
				case Character.TROUBLEMAKER: {
					if (playerIndex === -1) break;

					const troublemaker = player as Player<Character.TROUBLEMAKER>;
					const doppelgangerTroublemaker = player as Player<
						Character.DOPPELGANGER,
						Character.TROUBLEMAKER
					>;

					let action: typeof troublemaker.action = {
						first: null,
						second: null,
					};

					if (
						this.isDoppelganger(player) &&
						doppelgangerTroublemaker.action?.role?.action
					) {
						action = { ...doppelgangerTroublemaker.action.role.action };
					} else if (this.isDoppelganger(player) && troublemaker.action) {
						action = { ...troublemaker.action };
					}

					if (!action.first) {
						action.first = target.member.id;
					} else if (!action.second) {
						if (action.first === target.member.id) break;

						const first = this.findPlayerById(action.first)!;
						const second = target;

						action.second = second.member.id;

						[first.role, second.role] = [second.role, first.role];
					} else {
						break;
					}

					if (this.isDoppelganger(player)) {
						doppelgangerTroublemaker.action.role.action = action;
					} else {
						troublemaker.action = action;
					}

					break;
				}
				case Character.DRUNK: {
					if (centerIndex === -1) break;

					const drunk = player as Player<Character.DRUNK>;
					const doppelgangerDrunk = player as Player<
						Character.DOPPELGANGER,
						Character.DRUNK
					>;

					if (
						this.isDoppelganger(player)
							? doppelgangerDrunk.action?.role?.action
							: drunk.action
					)
						break;

					const action: typeof drunk.action = { center: centerIndex };

					if (this.isDoppelganger(player)) {
						doppelgangerDrunk.action.role.action = action;
					} else {
						drunk.action = action;
					}

					[player.role, this.centerCards[centerIndex]] = [
						this.centerCards[centerIndex],
						player.role!,
					];

					break;
				}
				default:
					throw new Error(
						`Unhandled reaction from character ${player.initialRole}.`
					);
			}

			await this.refreshDM(player.initialRole!);
		} else if (this.gameState === GameState.VOTING) {
			if (playerIndex === -1 || player.killing) return;

			player.killing = target.member.id;

			await this.refreshEmbed();
		}
	}
}
