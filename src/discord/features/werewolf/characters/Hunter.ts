import Discord from "discord.js";
import { Character } from "../Character";
import { CharacterModel } from "./CharacterModel";

export class Hunter extends CharacterModel {
	name = Character.HUNTER;
	description = "If you are killed, the player you voted for will also die.";
	image =
		"https://cf.geekdo-images.com/imagepage/img/TlZNLrMvaQhs7pLuu_7aW3vFpr4=/fit-in/900x600/filters:no_upscale()/pic4462587.png";

	nightAction = false;

	nightActionDM(): Discord.MessageEmbedOptions {
		return {};
	}
}
