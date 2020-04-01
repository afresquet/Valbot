import Discord from "discord.js";
import { DiscordFeature } from "../../types/Feature";
import { prefixChannel } from "../tools/prefixChannel";

const roleLineRegex = /^\s*([^\s]+)\s+(\w+)\s+\|\s+(.+)/;
const emojiRegex = /<:.+:(\d+)>/;

interface Role {
	name: string;
	emoji: Discord.GuildEmoji | string;
}

const extractRoles = (message: Discord.Message): Role[] => {
	const lines = message.content.split("\n");
	const roleLines = lines.filter(line => roleLineRegex.test(line));

	return roleLines.map(line => {
		const [emojiRaw, name] = roleLineRegex.exec(line)!.splice(1, 2);

		const emoji = emojiRegex.test(emojiRaw)
			? message.guild!.emojis.resolve(emojiRegex.exec(emojiRaw)![1])
			: emojiRaw;

		return { name, emoji };
	});
};

const onMessageReaction = (add: boolean = true) => (
	reaction: Discord.MessageReaction,
	user: Discord.User | Discord.PartialUser
) => {
	if (user.bot) return;

	if (
		(reaction.message.channel as Discord.TextChannel).name !==
		prefixChannel("roles")
	)
		return;

	const roles = extractRoles(reaction.message);

	const roleObj = roles.find(
		r =>
			((r.emoji as Discord.GuildEmoji).name || r.emoji) === reaction.emoji.name
	);

	const role = reaction.message.guild?.roles.cache.find(
		r => r.name === roleObj?.name
	);

	if (!role) return;

	const guildUser = reaction.message.guild?.member(user.id);

	if (!guildUser) return;

	if (add) {
		guildUser.roles.add(role);
	} else {
		guildUser.roles.remove(role);
	}
};

const onMessage = async (message: Discord.Message | Discord.PartialMessage) => {
	if (message.author?.bot) return;

	if ((message.channel as Discord.TextChannel).name !== prefixChannel("roles"))
		return;

	const roles = extractRoles(message as Discord.Message);

	for (let role of roles) {
		await message.react(role.emoji);
	}

	for (let reaction of message.reactions.cache.array()) {
		const shouldNotRemoveRole = roles.find(r => {
			const name = (r.emoji as Discord.GuildEmoji).name || r.emoji;
			return name === reaction.emoji.name;
		});

		if (shouldNotRemoveRole) return;

		reaction.remove();
	}
};

export const roles: DiscordFeature = (discord: Discord.Client) => {
	discord.on("ready", () => {
		const rolesChannel = discord.channels.cache.find(
			channel =>
				(channel as Discord.TextChannel).name === prefixChannel("roles")
		) as Discord.TextChannel;

		rolesChannel.messages.fetch();
	});

	discord.on("messageReactionAdd", onMessageReaction(true));
	discord.on("messageReactionRemove", onMessageReaction(false));

	discord.on("message", onMessage);
	discord.on("messageUpdate", (_, message) => onMessage(message));
};
