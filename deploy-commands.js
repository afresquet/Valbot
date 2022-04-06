const { readdirSync } = require("fs");
const { Routes } = require("discord-api-types/v9");
const { REST } = require("@discordjs/rest");
require("dotenv").config();

const commands = [];

const dirents = readdirSync(`${process.cwd()}/dist/commands`, {
	withFileTypes: true,
});
const directories = dirents
	.filter(dirent => dirent.isDirectory())
	.map(dirent => dirent.name);

for (const directory of directories) {
	// get all files from the current folder
	const files = readdirSync(
		`${process.cwd()}/dist/commands/${directory}`
	).filter(file => file.endsWith(".js"));

	for (const file of files) {
		const command =
			require(`${process.cwd()}/dist/commands/${directory}/${file}`).default;
		commands.push(command.data.toJSON());
	}
}

const rest = new REST({ version: "9" }).setToken(process.env.DISCORD_TOKEN);

const [clientId, guildId] = process.argv.slice(2);

(async () => {
	try {
		console.log("Started clearing application (/) commands...");

		const data = await rest.get(
			Routes.applicationGuildCommands(clientId, guildId)
		);

		await Promise.all(
			data.map(async command => {
				const deleteUrl = `${Routes.applicationGuildCommands(
					clientId,
					guildId
				)}/${command.id}`;
				return rest.delete(deleteUrl);
			})
		);

		console.log("Successfully cleared application (/) commands.");

		console.log("Started refreshing application (/) commands...");

		await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
			body: commands,
		});

		console.log("Successfully reloaded application (/) commands.");
	} catch (error) {
		console.error(error);
	}
})();
