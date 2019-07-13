const fetchMessages = async db => {
	const collection = db.collection("timer");

	const snapshot = await collection.get();

	return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const fetchSettings = async db => {
	const ref = db.collection("settings").doc("timer");

	const snapshot = await ref.get();

	return snapshot.data();
};

const addMessage = async (db, { id, message }) => {
	if (!id || !message) {
		throw new Error('missing arguments, use "!timer help".');
	}

	const ref = db.collection("timer").doc(id);

	const document = await ref.get();

	if (document.exists) {
		throw new Error(`timer message "${id}" already exists!`);
	}

	const snapshot = await ref.set({ message });

	return snapshot;
};

const editMessage = async (db, { id, message }) => {
	if (!id || !message) {
		throw new Error('missing arguments, use "!timer help".');
	}

	const ref = db.collection("timer").doc(id);

	const document = await ref.get();

	if (!document.exists) {
		throw new Error(`timer message "${id}" doesn't exist!`);
	}

	const snapshot = await ref.update({ message });

	return snapshot;
};

const deleteMessage = async (db, id) => {
	if (!id) {
		throw new Error('missing arguments, use "!timer help".');
	}

	const ref = db.collection("timer").doc(id);

	const document = await ref.get();

	if (!document.exists) {
		throw new Error(`timer message "${id}" doesn't exist!`);
	}

	const snapshot = await ref.delete();

	return snapshot;
};

const updateSettings = async (db, setting, value) => {
	if (!setting || !value) {
		throw new Error('missing arguments, use "!timer help".');
	}

	const parsedValue = parseInt(value);

	if (Number.isNaN(parsedValue)) {
		throw new Error("invalid value provided, it must be a number.");
	}

	const ref = db.collection("settings").doc("timer");

	const snapshot = await ref.get();

	const settings = snapshot.data();

	if (!Object.keys(settings).includes(setting)) {
		const settingsString = Object.keys(settings).reduce(
			(prev, cur) => `${prev}, ${cur}`
		);

		throw new Error(
			`invalid setting, possible settings are: ${settingsString}.`
		);
	}

	const updateSnapshot = await ref.update({ [setting]: parsedValue });

	return updateSnapshot;
};

export default async client => {
	let messages = await fetchMessages(client.db);
	const settings = await fetchSettings(client.db);

	const state = {
		lastTrigger: 0,
		messageCount: 0,
		messageIndex: 0
	};

	client.on("chat", (channel, userstate, message, self) => {
		if (self) return;

		if (!messages || messages.length === 0) return;

		if (message.startsWith("!")) return;

		state.messageCount += 1;

		if (state.messageCount < settings.messages) return;

		if (Date.now() - state.lastTrigger < settings.minutes * 1000 * 60) return;

		client.say(channel, messages[state.messageIndex].message);

		state.lastTrigger = Date.now();
		state.messageCount = 0;
		state.messageIndex =
			state.messageIndex + 1 >= messages.length ? 0 : state.messageIndex + 1;
	});

	client.on("chat", async (channel, userstate, message, self) => {
		try {
			if (self) return;

			if (!message.startsWith("!")) return;

			const [
				command,
				action,
				timerName,
				timerMessage
			] = client.tools.messageSplitter(message, 3);

			if (command !== "!timer") return;

			if (!client.tools.isMod(userstate)) return;

			const newMessage = { id: timerName, message: timerMessage };

			switch (action) {
				case "create":
				case "add": {
					await addMessage(client.db, newMessage);

					messages = [...messages, newMessage];

					client.say(
						channel,
						`@${userstate.username}, new message "${timerName}" was added to the timer!`
					);

					break;
				}
				case "update":
				case "edit": {
					await editMessage(client.db, newMessage);

					messages = messages.map(oldMessage =>
						oldMessage.id === timerName ? newMessage : oldMessage
					);

					client.say(
						channel,
						`@${userstate.username}, timer message "${timerName}" was updated!`
					);

					break;
				}
				case "remove":
				case "delete": {
					await deleteMessage(client.db, timerName);

					messages = messages.filter(({ id }) => id !== timerName);

					client.say(
						channel,
						`@${userstate.username}, message "${timerName}" was deleted from the timer!`
					);

					break;
				}
				case "set": {
					const [, , setting, value] = client.tools.messageSplitter(message, 4);

					await updateSettings(client.db, setting, value);

					client.say(
						channel,
						`@${userstate.username}, timer setting "${setting}" was set to ${value}!`
					);

					break;
				}
				case "help": {
					client.say(
						channel,
						`@${userstate.username}, !timer <action> <name> <message> - Available <actions> are "add", "edit" and "remove"; !timer set <setting> <value> - Available settings are "messages" and "minutes".`
					);

					break;
				}
				default: {
					client.say(
						channel,
						`@${userstate.username}, invalid action, use "!timer help".`
					);

					break;
				}
			}
		} catch (error) {
			client.say(channel, `@${userstate.username}, ${error.message}`);
		}
	});
};
