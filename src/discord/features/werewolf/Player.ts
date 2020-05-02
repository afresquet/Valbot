import Discord from "discord.js";
import { Actions, Character } from "./types";

export class Player<
	InitialCharacter extends Character = Character,
	DoppelgangerCharacter extends Character = Character
> {
	master = false;

	initialRole: InitialCharacter;
	role: Character;
	claimedRole: Character;

	action: Actions<InitialCharacter, DoppelgangerCharacter>;

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
