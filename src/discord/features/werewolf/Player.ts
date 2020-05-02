import Discord from "discord.js";
import { CharacterAction } from "./CharacterAction";
import { Character } from "./types";

export class Player<
	InitialCharacter extends Character = Character,
	CopiedCharacter extends Character = Character
> {
	master = false;

	initialRole: InitialCharacter;
	role: Character;
	claimedRole: Character;

	action: CharacterAction<InitialCharacter, CopiedCharacter>;

	killing: string;

	constructor(public member: Discord.GuildMember) {}

	setInitialRole(character: InitialCharacter) {
		this.role = character;
		this.initialRole = character;
	}

	clear() {
		delete this.initialRole;
		delete this.role;
		delete this.claimedRole;
		delete this.action;
		delete this.killing;
	}
}
