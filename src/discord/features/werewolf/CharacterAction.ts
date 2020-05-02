import { Character } from "./types";

export type CharacterAction<
	InitialCharacter extends Character,
	CopiedCharacter extends Character = Character
> = InitialCharacter extends "doppelganger"
	? DoppelgangerAction<CopiedCharacter>
	: InitialCharacter extends "seer"
	? SeerAction
	: InitialCharacter extends "robber"
	? RobberAction
	: InitialCharacter extends "troublemaker"
	? TroublemakerAction
	: InitialCharacter extends "drunk"
	? DrunkAction
	: undefined;

type DoppelgangerAction<CopiedCharacter extends Character> = {
	player: string;
	ready: boolean;
	role: {
		character: CopiedCharacter;
		action: CharacterAction<CopiedCharacter>;
	};
};

type SeerAction = {
	player?: string;
	first?: number;
	second?: number;
};

type RobberAction = {
	player: string;
};

type TroublemakerAction = {
	first?: string;
	second?: string;
};

type DrunkAction = {
	center: number;
};
