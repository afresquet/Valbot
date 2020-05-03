import Discord from "discord.js";
import { Character } from "./Character";
import { CharacterAction } from "./CharacterAction";

export class Player<
	InitialCharacter extends Character = Character,
	CopiedCharacter extends Character = Character
> {
	master = false;

	role: InitialCharacter;
	currentRole: Character;
	claimedRole: Character;

	action: CharacterAction<InitialCharacter, CopiedCharacter>;

	killing: string;

	constructor(public member: Discord.GuildMember) {}

	setRole(character: InitialCharacter) {
		this.role = character;
		this.currentRole = character;
	}

	clear() {
		delete this.role;
		delete this.currentRole;
		delete this.claimedRole;
		delete this.action;
		delete this.killing;
	}
}
