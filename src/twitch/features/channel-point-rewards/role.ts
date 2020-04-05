import { usernameRegex } from "../../../discord/helpers/regex";
import { TwitchFeature } from "../../../types/Feature";
import { PubSubListener } from "../../../types/PubSubListener";
import { rewardNameRegex } from "../../helpers/regex";

export const role: TwitchFeature = (twitch, discord) => {
	const listener: PubSubListener = async (channel, userstate, redemption) => {
		if (!rewardNameRegex.test(redemption.rewardName)) return;

		if (!usernameRegex.test(redemption.message)) {
			await twitch.say(
				channel,
				`@${userstate.name}, you didn't provide a valid Discord username in your message!`
			);

			return;
		}

		// TODO: make this scalable IF I'm ever opening the bot to many users.
		const guild = discord.guilds.cache.first();

		const discordUsername = usernameRegex.exec(redemption.message)![1];

		const user = guild?.members.cache.find(
			m => m.user.tag.toLowerCase() === discordUsername.toLowerCase()
		);

		if (!user) {
			await twitch.say(
				channel,
				`@${userstate.name}, there is no member in the server with such username!`
			);

			return;
		}

		const roleName = rewardNameRegex.exec(redemption.rewardName)![1];

		const role = guild?.roles.cache.find(
			r => r.name === roleName.toLowerCase()
		);

		if (!role) {
			await twitch.say(
				channel,
				`@${userstate.name}, there is no such role in the Discord, Val fucked up valKEKW`
			);

			return;
		}

		await user.roles.add(role);

		await twitch.say(
			channel,
			`@${userstate.name}, the role was given successfully! Check Discord!`
		);
	};
	twitch.on("pubsub" as any, listener);
};
