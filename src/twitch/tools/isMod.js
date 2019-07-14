export default userstate =>
	(userstate.badges && !!userstate.badges.broadcaster) || userstate.mod;
