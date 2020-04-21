import Discord from "discord.js";
import { join } from "path";
import { capitalize } from "../../../helpers/capitalize";
import { clamp } from "../../../helpers/clamp";
import { delay } from "../../../helpers/delay";
import { prefixChannel, prefixRole } from "../../../helpers/prefixString";
import { State } from "../../../helpers/State";
import { characters } from "./characters";
import {
	Character,
	Characters,
	GameState,
	NightActionCharacter,
	NightActionCharacters,
	numberEmojis,
	Player,
} from "./types";
import { WerewolfAudioManager } from "./WerewolfAudioManager";

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
			member,
			initialRole: null,
			role: null,
			master: false,
			killing: null,
		};

		if (this.players.current.length === 0) {
			await this.audioManager.join();

			player.master = true;
		}

		this.players.set(curr => [...curr, player]);

		member.roles.add(this.playerRole!);

		this.refreshEmbed();
	}

	leave(memberId: string) {
		const player = this.players.current.find(p => p.member.id === memberId);

		if (!player) return;

		this.players.set(curr => curr.filter(p => p.member.id !== memberId));

		player.member.roles.remove(this.playerRole!);

		if (this.players.current.length <= 0) {
			this.audioManager.leave();
		} else if (player.master) {
			this.randomMaster();
		}

		this.refreshEmbed();
	}

	async newGame() {
		if (!this.textChannel) return;

		if (this.gameState.current !== "NOT_PLAYING") return;

		this.gameMessage = await this.textChannel.send(this.preparationEmbed());

		this.gameState.set(() => "PREPARATION");
	}

	manageCharacter(character: Character, add: boolean) {
		this.characters.set(curr =>
			curr.map(c =>
				c.character === character
					? { ...c, amount: clamp(c.amount + (add ? 1 : -1), 0, 3) }
					: c
			)
		);

		this.refreshEmbed();
	}

	async start() {
		if (this.gameState.current !== "PREPARATION") return;

		const charactersAmount = this.characters.current.reduce(
			(result, current) => result + current.amount,
			0
		);
		const playersAmount = this.players.current.length + 3;

		if (charactersAmount !== playersAmount) return;

		await this.assignRoles();

		await this.night();

		await this.day();

		await this.voting();

		this.finish();
	}

	async assignRoles() {
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

		this.refreshEmbed();

		const messages = await Promise.all(
			this.players.current.map(player =>
				player.member.send(this.roleEmbed(player))
			)
		);

		await delay(this.roleTimer.current * 3 * 1000);

		await Promise.all(messages.map(message => message.delete()));
	}

	async night() {
		this.gameState.set(() => "NIGHT");

		this.refreshEmbed();

		await Promise.all([
			this.audioManager.play(this.soundPath(characters.everyone.sounds.close)),
			this.muteAll(true),
		]);

		for (const character of NightActionCharacters) {
			await this.playCharacter(character);
		}

		await delay(2000);
	}

	async day() {
		this.gameState.set(() => "DAY");

		await this.audioManager.play(
			this.soundPath(characters.everyone.sounds.wake)
		);

		await this.muteAll(false);

		await delay(this.gameTimer.current * 1000);
	}

	async voting() {
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

		this.refreshEmbed();

		await delay(this.roleTimer.current * 1000);

		await Promise.all(messages.map(message => message.delete()));
	}

	finish() {
		this.gameState.set(() => "NOT_PLAYING");

		this.gameMessage = null;
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

	setMaster(memberId: string) {
		if (!this.players.current.find(p => p.member.id === memberId)) return;

		this.players.set(curr =>
			curr.map(p => ({ ...p, master: p.member.id === memberId }))
		);

		this.refreshEmbed();
	}

	randomMaster() {
		const randomIndex = Math.floor(Math.random() * this.players.current.length);

		this.players.set(curr =>
			curr.map((player, index) =>
				index === randomIndex ? { ...player, master: true } : player
			)
		);
	}

	toggleExpert() {
		this.expert.set(curr => !curr);

		this.refreshEmbed();
	}

	changeTimer(timer: "game" | "role", seconds: number) {
		if (timer === "game") {
			this.gameTimer.set(() => (seconds > 0 ? seconds : 0));
		} else if (timer === "role") {
			this.roleTimer.set(() => (seconds > 0 ? seconds : 0));
		}

		this.refreshEmbed();
	}

	changeVolume(volume: number) {
		this.audioManager.setVolume(volume);

		this.refreshEmbed();
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

		this.nightActionDM = await player.member.send(
			this.nightActionDMEmbed(player)
		);

		await delay(this.roleTimer.current * 1000);

		await this.nightActionDM.delete();

		this.nightActionDM = null;
	}

	private refreshEmbed() {
		if (!this.gameMessage) return;

		switch (this.gameState.current) {
			case "PREPARATION":
				this.gameMessage.edit(this.preparationEmbed());
				break;
			case "ROLE_ASSIGNING":
				this.gameMessage.edit(this.roleAssigningEmbed());
				break;
			case "NIGHT":
				this.gameMessage.edit(this.nightEmbed());
				break;
			case "VOTING":
				this.gameMessage.edit(this.votingEmbed());
				break;
			case "NOT_PLAYING":
			default:
				break;
		}
	}

	baseEmbed(options: Discord.MessageEmbedOptions) {
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

	preparationEmbed() {
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

	roleAssigningEmbed() {
		return this.baseEmbed({
			title: "Check your DMs to view your role!",
			description: "Game will begin shortly, be prepared!",
		});
	}

	roleEmbed(player: Player) {
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

	nightEmbed() {
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

	nightActionDMEmbed(player: Player) {
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
			default:
				throw new Error(
					`Unhandled night action character "${player.initialRole}".`
				);
		}
	}

	nightTeammatesDescription(role: Character, id: string) {
		const placeholder = `There are no ${role} players!`;

		return this.players.current.reduce((result, current, index) => {
			if (current.initialRole !== role) return result;

			const playerLine = `${numberEmojis[index]} ${
				current.member.displayName
			} ${current.member.id === id ? "(You)" : ""}`;

			return result === placeholder ? playerLine : `${result}\n${playerLine}`;
		}, placeholder);
	}

	votingEmbed() {
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

	playerVotingEmbed(player: Player) {
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

	handleReaction(reaction: Discord.MessageReaction, user: Discord.User) {
		if (this.gameState.current === "VOTING") {
			const index = numberEmojis.indexOf(reaction.emoji.name);

			if (index === -1) return;

			const player = this.players.current.find(
				(p, i) => p.member.id === user.id && i !== index
			);

			if (!player || player.killing !== null) return;

			this.players.set(curr =>
				curr.map(p => (p.member.id === user.id ? { ...p, killing: index } : p))
			);

			this.refreshEmbed();
		}
	}
}
