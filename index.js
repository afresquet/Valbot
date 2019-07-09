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
	if (message.channel.name !== "suggestions") return;

	await message.react("✅");
	await message.react("❌");
});

// Roles
client.on("messageReactionAdd", async (reaction, user) => {
	if (reaction.message.channel.name !== "roles") return;

	const roles = reaction.message.content
		.split("\n")
		.splice(2)
		.map(role => role.split(" "));

	const role = roles.find(([emoji]) => emoji === reaction.emoji.name);

	if (!role) return;

	let serverRole = reaction.message.guild.roles.find(r => r.name === role[1]);

	if (!serverRole) {
		serverRole = await reaction.message.guild.createRole({ name: role[1] });
	}

	const guildMember = reaction.message.guild.member(user);

	if (guildMember.roles.find(r => r.name === serverRole.name)) return;

	await guildMember.addRole(serverRole);

	await user.send(`I gave you the "${serverRole.name}" role.`);
});
client.on("messageReactionRemove", async (reaction, user) => {
	if (reaction.message.channel.name !== "roles") return;

	const roles = reaction.message.content
		.split("\n")
		.splice(2)
		.map(role => role.split(" "));

	const role = roles.find(([emoji]) => emoji === reaction.emoji.name);

	if (!role) return;

	let serverRole = reaction.message.guild.roles.find(r => r.name === role[1]);

	if (!serverRole) return;

	const guildMember = reaction.message.guild.member(user);

	if (!guildMember.roles.find(r => r.name === serverRole.name)) return;

	await guildMember.removeRole(serverRole);

	await user.send(`I removed you from the "${serverRole.name}" role.`);
});
// Roles reaction updates
client.on("messageUpdate", async (_, message) => {
	if (message.channel.name !== "roles") return;

	const emojis = message.content
		.split("\n")
		.splice(2)
		.map(text => text.split(" ")[0]);

	emojis.forEach(emoji => {
		if (message.reactions.find(e => e.emoji.name === emoji)) return;

		message.react(emoji);
	});

	message.reactions.forEach(async e => {
		if (emojis.includes(e.emoji.name)) return;

		const users = await e.fetchUsers();

		users.forEach(u => e.remove(u.id));
	});
});

client.login(process.env.DISCORD_TOKEN);
