const fetchCommandMessage = async (db, command) => {
	switch (command) {
		case "!twitter":
			return "You can follow me on Twitter at http://twitter.valaxor.com/ valaxoSmile";
		case "!discord":
			return "You can join my Discord server by clicking this link: http://discord.valaxor.com/ valaxoSmile";
		case "!amazing":
			return "This is amazing... I think you can do better, you got a lot of missclicks buttons!! Could you try again better?!";
		default:
			return;
	}
};

const addCommand = async (db, command, message) => {
	if (!command || !message)
		return { error: 'missing arguments, use "!commands help".' };

	return {};
};

const editCommand = async (db, command, message) => {
	if (!command || !message)
		return { error: 'missing arguments, use "!commands help".' };

	return {};
};

const removeCommand = async (db, command) => {
	if (!command) return { error: 'missing arguments, use "!commands help".' };

	return {};
};

export default client => {
	client.onEvent("chat", async (channel, userstate, message, self) => {
		if (self) return;

		if (!message.startsWith("!")) return;

		const [command] = client.tools.messageSplitter(message);

		if (command === "!commands") return;

		const commandMessage = await fetchCommandMessage(client.db, command);

		if (!commandMessage) return;

		client.say(channel, commandMessage);
	});

	client.onEvent("chat", async (channel, userstate, message, self) => {
		if (self) return;

		if (!client.tools.isMod(userstate)) return;

		if (!message.startsWith("!commands")) return;

		const [
			command,
			action,
			commandName,
			commandMessage
		] = client.tools.messageSplitter(message, 3);

		if (command !== "!commands") return;

		switch (action) {
			case "create":
			case "add": {
				const { error } = await addCommand(
					client.db,
					commandName,
					commandMessage
				);

				if (error) {
					client.say(channel, `@${userstate.username}, ${error}`);

					break;
				}

				client.say(
					channel,
					`@${userstate.username}, command "${commandName}" was added!`
				);

				break;
			}
			case "update":
			case "edit": {
				const { error } = await editCommand(
					client.db,
					commandName,
					commandMessage
				);

				if (error) {
					client.say(channel, `@${userstate.username}, ${error}`);

					break;
				}

				client.say(
					channel,
					`@${userstate.username}, command "${commandName}" was edited!`
				);

				break;
			}
			case "remove":
			case "delete": {
				const { error } = await removeCommand(client.db, commandName);

				if (error) {
					client.say(channel, `@${userstate.username}, ${error}`);

					break;
				}

				client.say(
					channel,
					`@${userstate.username}, command "${commandName}" was removed!`
				);

				break;
			}
			case "help": {
				client.say(
					channel,
					`@${userstate.username}, !commands <action> <name> <message> - Available <actions> are "add", "edit" and "remove".`
				);

				break;
			}
			default: {
				client.say(
					channel,
					`@${userstate.username}, invalid action, use "!commands help".`
				);

				break;
			}
		}
	});
};
