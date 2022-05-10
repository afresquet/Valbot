const { SuggestionModel } = require("../../../schemas/Suggestion");

const suggestCommand = require("../suggestion").default;

describe("suggestions suggestion command", () => {
	const avatarUrl = "avatarUrl";
	const type = "Command";
	const suggestion = "Suggestion";

	const interaction = {
		guild: { id: "guildId" },
		channel: { id: "channelId" },
		user: {
			username: "username",
			displayAvatarURL: jest.fn(() => avatarUrl),
		},
		options: {
			getString: jest.fn(str => (str === "type" ? type : suggestion)),
		},
		reply: jest.fn(),
	};

	beforeEach(jest.clearAllMocks);

	test("creates a suggestion embed", async () => {
		jest
			.spyOn(SuggestionModel, "findByGuild")
			.mockReturnValueOnce({ channelId: "channelId" });

		await suggestCommand.execute(interaction);

		expect(interaction.options.getString).toHaveBeenCalledTimes(2);
		expect(interaction.reply).toHaveBeenCalledWith({
			embeds: expect.arrayContaining([
				expect.objectContaining({
					author: expect.objectContaining({
						name: interaction.user.username,
						iconURL: avatarUrl,
					}),
					fields: expect.arrayContaining([
						expect.objectContaining({ name: "Suggestion", value: suggestion }),
						expect.objectContaining({ name: "Type", value: type }),
						expect.objectContaining({ name: "Status", value: "Pending" }),
					]),
				}),
			]),
			components: expect.arrayContaining([
				expect.objectContaining({
					components: expect.arrayContaining([
						expect.objectContaining({
							type: "BUTTON",
							label: "✅ Accept",
						}),
						expect.objectContaining({
							type: "BUTTON",
							label: "⛔ Decline",
						}),
					]),
				}),
			]),
			fetchReply: true,
		});
	});

	test("fails if it's not setup beforehand", async () => {
		jest.spyOn(SuggestionModel, "findByGuild").mockReturnValueOnce();

		await suggestCommand.execute(interaction);

		expect(interaction.reply).toHaveBeenCalledWith({
			content: "Suggestions are not enabled on this server.",
			ephemeral: true,
		});
	});

	test("fails if it's not the right channel", async () => {
		const configuration = { channelId: "otherChannelId" };

		jest
			.spyOn(SuggestionModel, "findByGuild")
			.mockReturnValueOnce(configuration);

		await suggestCommand.execute(interaction);

		expect(interaction.reply).toHaveBeenCalledWith({
			content: `You can't use this command here, go to <#${configuration.channelId}> instead.`,
			ephemeral: true,
		});
	});
});
