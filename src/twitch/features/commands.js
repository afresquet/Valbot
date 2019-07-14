const fetchCommand = async (db, command) => {
	const ref = db.collection("commands").doc(command);

	const document = await ref.get();

	if (!document.exists) {
		return null;
	}

	return document.data().message;
};

const addCommand = async (db, command, message) => {
	if (!command || !message)
		return { error: 'missing arguments, use "!commands help".' };

	const ref = db.collection("commands").doc(command);

	const document = await ref.get();

	if (document.exists) {
		return { error: `command "${command}" already exists!` };
	}

	const snapshot = await ref.set({ message });

	return { snapshot };
};

const editCommand = async (db, command, message) => {
	if (!command || !message)
		return { error: 'missing arguments, use "!commands help".' };

	const ref = db.collection("commands").doc(command);

	const document = await ref.get();

	if (!document.exists) {
		return { error: `command "${command}" doesn't exist!` };
	}

	const snapshot = await ref.update({ message });

	return { snapshot };
};

const removeCommand = async (db, command) => {
	if (!command) return { error: 'missing arguments, use "!commands help".' };

	const ref = db.collection("commands").doc(command);

	const document = await ref.get();

	if (!document.exists) {
		return { error: `command "${command}" doesn't exist!` };
	}

	const snapshot = await ref.delete();

	return { snapshot };
};

export default client => {
	client.onEvent("chat", async (channel, userstate, message, self) => {
		if (self) return;

		if (!message.startsWith("!")) return;

		const [command] = client.tools.messageSplitter(message);

		if (command === "!commands") return;

		const commandMessage = await fetchCommand(client.db, command);

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
			cmdName,
			commandMessage
		] = client.tools.messageSplitter(message, 3);

		if (command !== "!commands") return;

		const commandName = cmdName.startsWith("!") ? cmdName : `!${cmdName}`;

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
