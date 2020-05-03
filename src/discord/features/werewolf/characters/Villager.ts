import { Character } from "../Character";
import { CharacterModel } from "./CharacterModel";

export class Villager extends CharacterModel {
	name = Character.VILLAGER;
	description =
		"You will figure out who the bad guys are, and make sure one of them is killed.";
	image =
		"https://cf.geekdo-images.com/imagepage/img/PsaeiAGo4yVQQGhE-7995uZDCc8=/fit-in/900x600/filters:no_upscale()/pic4462615.png";

	protected maxAmount = 3;

	nightAction = false;
}
