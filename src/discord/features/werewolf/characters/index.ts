import { Character } from "../Character";
import { CharacterModel } from "./CharacterModel";
import { Doppelganger } from "./Doppelganger";
import { Drunk } from "./Drunk";
import { Hunter } from "./Hunter";
import { Insomniac } from "./Insomniac";
import { Mason } from "./Mason";
import { Minion } from "./Minion";
import { Robber } from "./Robber";
import { Seer } from "./Seer";
import { Tanner } from "./Tanner";
import { Troublemaker } from "./Troublemaker";
import { Villager } from "./Villager";
import { Werewolf } from "./Werewolf";

export const characters = new Map<Character, CharacterModel>();

characters.set(Character.DOPPELGANGER, new Doppelganger());

characters.set(Character.WEREWOLF, new Werewolf());

characters.set(Character.MINION, new Minion());

characters.set(Character.MASON, new Mason());

characters.set(Character.SEER, new Seer());

characters.set(Character.ROBBER, new Robber());

characters.set(Character.TROUBLEMAKER, new Troublemaker());

characters.set(Character.DRUNK, new Drunk());

characters.set(Character.INSOMNIAC, new Insomniac());

characters.set(Character.VILLAGER, new Villager());

characters.set(Character.HUNTER, new Hunter());

characters.set(Character.TANNER, new Tanner());
