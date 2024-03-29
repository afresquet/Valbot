declare namespace NodeJS {
	interface ProcessEnv {
		ENV: string;
		MONGODB_URI: string;
		DISCORD_TOKEN: string;
		TWITCH_USERNAME: string;
		TWITCH_PASSWORD: string;
		DISCORD_CLIENT_ID: string;
		DISCORD_GUILD_ID: string;
	}
}
