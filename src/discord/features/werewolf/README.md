# One Night Ultimate Werewolf

## Game Rules

Read the official game rules by clicking [here](https://www.fgbradleys.com/rules/rules2/OneNightUltimateWerewolf-rules.pdf).

## How to Play

In order to play the game, you need to allow Direct Messages (DM) to be received from members of the server. Please make sure to enable this by checking the checkbox at Server > Privacy Settings > Allow direct messages from server members ✅.

This is so the bot is able to send you a DM with information about your role, and when you are required to do any actions. Please DO NOT privately message other players as that is a huge advantage (for example: the Minion letting their Werewolves know that they are the Minion). Please do not discuss strategy or anything that would give you an advantage over the rest privately. If you want to send memes however, then go for it (looking at you Sid).

A good practice is to set your "server name" to whatever nickname people know you for. It's easier to know who someone is if they have their name instead of a meme name.

The player that joins the game first will become the "Master". They will choose the characters and settings the games will be played with.

Once everything is ready, the master will start the game and everyone will be given a role. The bot will send you a DM with the information.

At night, everyone goes to sleep. There is no real way to prevent cheating (unless everything was handled through text, but that would be no fun), so please don't peek. The game is meant to be played for fun. Cheating beats the purpose of having fun for everyone else.

If your role has a night action, you will be asked to awake to perform your action. The bot will send you a DM with your action. You'll have a limited amount of time to perform it, so make sure to do it in time.

Once the sun rises it'll become day and everyone will awaken. A timer will start counting down, and when it hits 0 you'll have to figure out who to kill.

Voting will be handled through reactions at the game text channel. If you don't vote for anyone it will default to the player to the number following yours, or player 1 in case of the last player.

## Characters

- Werewolf
- Minion
- Mason
- Seer
- Robber
- Troublemaker
- Drunk
- Insomniac
- Villager
- Hunter
- Tanner

Currently Doppelganger is not supported, but I will add it soon™.

## Commands

All of the commands except `!cancel` and `!volume` can only be used when a game is not currently going on.

### `!join`

Let's you join the game. Only after using this command will you be able to talk in the voice channel.

### `!leave`

Let's you leave the game.

### `!kick <@player>` (Master only)

Kicks a player from the game and from the voice channel.

### `!ban <@player>` (Mod only)

Bans a player from joining the game and the voice call. Will also kick them from the voice channel.

A "banned" role is applied to them, in order from them to play again that role has to be removed.

### `!rules <character>`

Reads out the rules of the character.

### `!newgame`

Starts a new game in "Preparation" mode.

### `!add <character>` and `!remove <character>` (Master only)

Adds or removes a character from the game.

### `!start` (Master only)

Starts the game from "Preparation" mode.

### `!cancel` (Master only)

Stops the game at "Day" time only.

### `!master <@player>` (Master only)

Passes the "master" status to another player.

### `!forcemaster <@player>` (Mod only)

Like `!master`, but can be used by a server mod to force someone to be the master. Useful if the master left and the role can't be passed.

### `!expert` (Master only)

Toggles "Expert Mode" on and off.

### `!timer game <seconds>` and `!timer role <seconds>` (Master only)

Changes the timer duration of the day period (game) or for each night action (role).

### `!volume <value>` (Master only)

Changes the volume. Value has to be a number from 0 to 200. Can be used even if a game is currently running.
