import { Character } from "../Character";
import { CharacterModel } from "./CharacterModel";

export class Tanner extends CharacterModel {
	name = Character.TANNER;
	description = "You will win and everyone else will lose if you are killed.";
	image =
		"https://cf.geekdo-images.com/imagepage/img/UkNvWkkev_3IZFRjRvslxYTmK34=/fit-in/900x600/filters:no_upscale()/pic4462480.png";

	nightAction = false;
}
