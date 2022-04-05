declare namespace NodeJS {
	interface ProcessEnv {
		ENV: string;
		MONGODB_URI: string;
		DISCORD_TOKEN: string;
		TWITCH_BOT_USERNAME: string;
		TWITCH_BOT_PASSWORD: string;
	}
}
