import Discord from "discord.js";

export type GameState =
	| "NOT_PLAYING"
	| "PREPARATION"
	| "ROLE_ASSIGNING"
	| "NIGHT"
	| "DAY"
	| "VOTING";

// This is a mess
export const CharactersMetaData: {
	[character: string]: { description: string; image: string };
} = {
	doppelganger: {
		description:
			"You will look at any other player's card and will become that role yourself, in addition to the player with that role.",
		image:
			"https://cf.geekdo-images.com/imagepage/img/rP3xvC-HFqIonPj5mmr6_1lJYJ8=/fit-in/900x600/filters:no_upscale()/pic4462582.png",
	},
	werewolf: {
		description:
			"You will wake and look for the other werewolves. You will win if no werewolves are killed.",
		image:
			"https://cf.geekdo-images.com/imagepage/img/tgyrEJ3RbB_sZlme9eHu-ZKQ-vo=/fit-in/900x600/filters:no_upscale()/pic4462616.png",
	},
	minion: {
		description:
			"You will know who the werewolves are. You will win if no werewolves are killed, even if you are killed.",
		image:
			"https://cf.geekdo-images.com/imagepage/img/ePtQq2ZqGJ06HpM5I6CaYp3FixA=/fit-in/900x600/filters:no_upscale()/pic4462593.png",
	},
	mason: {
		description: "You will wake and look for the other mason.",
		image:
			"https://cf.geekdo-images.com/imagepage/img/FeKsR8xD1jOgzFNx-V2Y-qIxT54=/fit-in/900x600/filters:no_upscale()/pic4462591.png",
	},
	seer: {
		description:
			"You will view either two of the center roles, or one role from any other player.",
		image:
			"https://cf.geekdo-images.com/imagepage/img/Y5Kj8KnsVPX9uJBn2mRw64WUzY4=/fit-in/900x600/filters:no_upscale()/pic4462604.png",
	},
	robber: {
		description:
			"You will exchange your role with another player's role, and will view your new role.",
		image:
			"https://cf.geekdo-images.com/imagepage/img/rv16CisR0fsy8pkEOAAZkGwTsFk=/fit-in/900x600/filters:no_upscale()/pic4462602.png",
	},
	troublemaker: {
		description: "You will exchange roles between any two other roles.",
		image:
			"https://cf.geekdo-images.com/imagepage/img/2gB7ClAu4p7rrs8ipGnNAfOOO-w=/fit-in/900x600/filters:no_upscale()/pic4462611.png",
	},
	drunk: {
		description:
			"You will exchange your role with a role from the center, but you will not view your new role.",
		image:
			"https://cf.geekdo-images.com/imagepage/img/IC7i93WsW03tEbcXHmeV6OxEr_c=/fit-in/900x600/filters:no_upscale()/pic4462584.png",
	},
	insomniac: {
		description: "You will view your own role.",
		image:
			"https://cf.geekdo-images.com/imagepage/img/RHfz10FGfiYxunbUsJt1_xNwrS4=/fit-in/900x600/filters:no_upscale()/pic4462588.png",
	},
	villager: {
		description:
			"You will figure out who the bad guys are, and make sure one of them is killed.",
		image:
			"https://cf.geekdo-images.com/imagepage/img/PsaeiAGo4yVQQGhE-7995uZDCc8=/fit-in/900x600/filters:no_upscale()/pic4462615.png",
	},
	hunter: {
		description: "If you are killed, the player you voted for will also die.",
		image:
			"https://cf.geekdo-images.com/imagepage/img/TlZNLrMvaQhs7pLuu_7aW3vFpr4=/fit-in/900x600/filters:no_upscale()/pic4462587.png",
	},
	tanner: {
		description: "You will win and everyone else will lose if you are killed.",
		image:
			"https://cf.geekdo-images.com/imagepage/img/UkNvWkkev_3IZFRjRvslxYTmK34=/fit-in/900x600/filters:no_upscale()/pic4462480.png",
	},
};

export const NightActionCharacters = [
	"doppelganger",
	"werewolf",
	"minion",
	"mason",
	"seer",
	"robber",
	"troublemaker",
	"drunk",
	"insomniac",
] as const;

export const Characters = [
	...NightActionCharacters,
	"villager",
	"hunter",
	"tanner",
] as const;

export type Character = typeof Characters[number];
export type NightActionCharacter = typeof NightActionCharacters[number];

export interface Player {
	member: Discord.GuildMember;
	role: Character | null;
	master: boolean;
}

export const numberEmojis = [
	"1️⃣",
	"2️⃣",
	"3️⃣",
	"4️⃣",
	"5️⃣",
	"6️⃣",
	"7️⃣",
	"8️⃣",
	"9️⃣",
	"🔟",
];
