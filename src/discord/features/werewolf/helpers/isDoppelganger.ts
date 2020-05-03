import { Character } from "../Character";
import { Player } from "../Player";

export const isDoppelganger = (player: Player) => {
	return player.initialRole === Character.DOPPELGANGER;
};
