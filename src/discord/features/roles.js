import isProduction from "../../helpers/isProduction";

export default client => {
	const regex = /^\s*([^\s]+)\s+(\w+)\s+\|\s+(.+)/;

	const roleExtractor = message => {
		const lines = message.content.split("\n");
		const roleLines = lines.filter(line => regex.test(line));

		const roles = roleLines.map(roleLine => {
			const [emojiRaw, name, description] = regex.exec(roleLine).splice(1, 3);

			let emoji = emojiRaw;

			if (/<:.+:(\d+)>/.test(emojiRaw)) {
				emoji = message.guild.emojis.get(/<:.+:(\d+)>/.exec(emojiRaw)[1]);
			}

			return { name, description, emoji };
		});

		return roles;
	};

	const onMessageReaction = (add = true) => async (reaction, user) => {
		// if (!isProduction) return;

		if (user.bot) return;

		if (reaction.message.channel.name !== "roles") return;

		const roles = roleExtractor(reaction.message);

		const role = roles.find(
			({ emoji }) => (emoji.name || emoji) === reaction.emoji.name
		);

		if (!role) return;

		let serverRole = reaction.message.guild.roles.find(
			r => r.name === role.name
		);

		if (!serverRole) {
			if (add) {
				// eslint-disable-next-line require-atomic-updates
				serverRole = await reaction.message.guild.createRole({
					name: role.name
				});
			} else if (!add) {
				return;
			}
		}

		const guildMember = reaction.message.guild.member(user);

		if (add) {
			if (guildMember.roles.find(r => r.name === serverRole.name)) return;

			await guildMember.addRole(serverRole);

			await user.send(
				`The role "${serverRole.name}" has been given to you! If you wish to remove it, remove your reaction on the same message.`
			);
		} else {
			if (!guildMember.roles.find(r => r.name === serverRole.name)) return;

			await guildMember.removeRole(serverRole);

			await user.send(
				`The role "${serverRole.name}" has been removed from you! If you wish to add it back, react again on the same message.`
			);
		}
	};
	client.on("messageReactionAdd", onMessageReaction(true));
	client.on("messageReactionRemove", onMessageReaction(false));

	// Roles reaction updates
	const onMessage = async message => {
		if (!isProduction) return;

		if (message.author.bot) return;

		if (message.channel.name !== "roles") return;

		const roles = roleExtractor(message);

		roles.forEach(({ emoji }) => {
			if (message.reactions.find(e => e.emoji.name === (emoji.name || emoji)))
				return;

			message.react(emoji);
		});

		message.reactions.forEach(async reaction => {
			if (
				roles.find(
					role => reaction.emoji.name === (role.emoji.name || role.emoji)
				)
			)
				return;

			const users = await reaction.fetchUsers();

			users.forEach(user => reaction.remove(user.id));
		});
	};
	client.on("message", onMessage);
	client.on("messageUpdate", (_, message) => onMessage(message));
};
