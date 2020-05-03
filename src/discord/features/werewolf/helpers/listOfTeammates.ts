import { ArrayLikeMap } from "../../../../helpers/ArrayLikeMap";
import { Character } from "../Character";
import { numberEmojis } from "../emojis";
import { Player } from "../Player";

export const listOfTeammates = (
	player: Player,
	role: Character,
	players: ArrayLikeMap<string, Player>,
	defaultValue: string = `There are no ${role} players!`
) => {
	return players.reduce((result, current, id, index) => {
		if (
			current.isDoppelganger
				? (current as Player<Character.DOPPELGANGER>).action.role.character !==
				  role
				: current.role !== role
		) {
			return result;
		}

		const playerLine = `${numberEmojis[index]} ${current.member.displayName} ${
			player.member.id === id ? "(You)" : ""
		}`;

		return result === defaultValue ? playerLine : `${result}\n${playerLine}`;
	}, defaultValue);
};
