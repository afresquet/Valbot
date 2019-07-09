const Discord = require("discord.js");
const dotenv = require("dotenv");

dotenv.config();

const client = new Discord.Client();

client.on("ready", () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on("raw", async packet => {
	if (packet.t !== "MESSAGE_UPDATE") return;
	// Grab the channel to check the message from
	const channel = client.channels.get(packet.d.channel_id);
	// There's no need to emit if the message is cached, because the event will fire anyway for that
	if (channel.messages.has(packet.d.id)) return;

	const message = await channel.fetchMessage(packet.d.id);

	client.emit("messageUpdate", "", message);
});
client.on("raw", packet => {
	// We don't want this to run on unrelated packets
	if (!["MESSAGE_REACTION_ADD", "MESSAGE_REACTION_REMOVE"].includes(packet.t))
		return;
	// Grab the channel to check the message from
	const channel = client.channels.get(packet.d.channel_id);
	// There's no need to emit if the message is cached, because the event will fire anyway for that
	if (channel.messages.has(packet.d.message_id)) return;
	// Since we have confirmed the message is not cached, let's fetch it
	channel.fetchMessage(packet.d.message_id).then(message => {
		// Emojis can have identifiers of name:id format, so we have to account for that case as well
		const emoji = packet.d.emoji.id
			? `${packet.d.emoji.name}:${packet.d.emoji.id}`
			: packet.d.emoji.name;
		// This gives us the reaction we need to emit the event properly, in top of the message object
		const reaction = message.reactions.get(emoji);
		// Adds the currently reacting user to the reaction's users collection.
		if (reaction)
			reaction.users.set(packet.d.user_id, client.users.get(packet.d.user_id));
		// Check which type of event it is before emitting
		if (packet.t === "MESSAGE_REACTION_ADD") {
			client.emit(
				"messageReactionAdd",
				reaction,
				client.users.get(packet.d.user_id)
			);
		}
		if (packet.t === "MESSAGE_REACTION_REMOVE") {
			client.emit(
				"messageReactionRemove",
				reaction,
				client.users.get(packet.d.user_id)
			);
		}
	});
});

// Suggestions reactions
client.on("message", async message => {
	if (message.author.bot) return;

	if (message.channel.name !== "suggestions") return;

	await message.react("✅");
	await message.react("❌");
});

// Roles
const regex = /^\s*([^\s]+)\s+(\w+)\s+\|\s+(.+)/;
const roleExtractor = message => {
	const lines = message.content.split("\n");
	const roleLines = lines.filter(line => regex.test(line));

	const roles = roleLines.map(roleLine => {
		const [emojiRaw, name, description] = regex.exec(roleLine).splice(1, 3);

		let emoji = emojiRaw;

		if (/<:.+:(\d+)>/.test(emojiRaw)) {
			emoji = message.guild.emojis.get(/<:.+:(\d+)>/.exec(emoji)[1]);
		}

		return { name, description, emoji };
	});

	return roles;
};
client.on("messageReactionAdd", async (reaction, user) => {
	if (user.bot) return;

	if (reaction.message.channel.name !== "roles") return;

	const roles = roleExtractor(reaction.message);

	const role = roles.find(
		({ emoji }) => (emoji.name || emoji) === reaction.emoji.name
	);

	if (!role) return;

	let serverRole = reaction.message.guild.roles.find(r => r.name === role.name);

	if (!serverRole) {
		serverRole = await reaction.message.guild.createRole({ name: role.name });
	}

	const guildMember = reaction.message.guild.member(user);

	if (guildMember.roles.find(r => r.name === serverRole.name)) return;

	await guildMember.addRole(serverRole);

	await user.send(`I gave you the "${serverRole.name}" role.`);
});
client.on("messageReactionRemove", async (reaction, user) => {
	if (user.bot) return;

	if (reaction.message.channel.name !== "roles") return;

	const roles = roleExtractor(reaction.message);

	const role = roles.find(
		({ emoji }) => (emoji.name || emoji) === reaction.emoji.name
	);

	if (!role) return;

	let serverRole = reaction.message.guild.roles.find(r => r.name === role.name);

	if (!serverRole) return;

	const guildMember = reaction.message.guild.member(user);

	if (!guildMember.roles.find(r => r.name === serverRole.name)) return;

	await guildMember.removeRole(serverRole);

	await user.send(`I removed you from the "${serverRole.name}" role.`);
});
// Roles reaction updates
const rolesReactions = async message => {
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
client.on("message", rolesReactions);
client.on("messageUpdate", (_, message) => rolesReactions(message));

client.login(process.env.DISCORD_TOKEN);
