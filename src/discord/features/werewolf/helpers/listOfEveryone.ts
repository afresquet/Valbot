import { ArrayLikeMap } from "../../../../helpers/ArrayLikeMap";
import { numberEmojis } from "../emojis";
import { Player } from "../Player";

export const listOfEveryone = (
	players: ArrayLikeMap<string, Player>,
	omit: string[] = [],
	defaultValue: string = "There are no players."
) => {
	return players.reduce((result, player, id, index) => {
		if (omit.includes(id)) return result;

		const playerLine = `${numberEmojis[index]} ${player.member.displayName}`;

		return result === defaultValue ? playerLine : `${result}\n${playerLine}`;
	}, defaultValue);
};
