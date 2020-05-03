import { Player } from "../Player";

export const findPlayerById = (players: Player[], id: string) => {
	return players.find(player => player.member.id === id);
};
