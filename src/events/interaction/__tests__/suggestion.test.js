const { MessageEmbed } = require("discord.js");

const suggestionEvent = require("../suggestion").default;

describe("suggestion event", () => {
	const interaction = {
		isButton: jest.fn(() => true),
		message: {
			embeds: [
				new MessageEmbed({})
					.setColor("BLUE")
					.setAuthor({
						name: "user",
						iconURL: "avatarUrl",
					})
					.addFields(
						{ name: "Suggestion", value: "Suggestion" },
						{ name: "Type", value: "Type", inline: true },
						{ name: "Status", value: "Pending", inline: true }
					),
			],
		},
		customId: "customId",
		update: jest.fn(),
	};

	beforeEach(jest.clearAllMocks);

	test("updates embed to accepted", async () => {
		await suggestionEvent.execute({
			...interaction,
			customId: "suggestion-accept",
		});

		expect(interaction.update).toHaveBeenCalledWith({
			embeds: [
				expect.objectContaining({
					fields: expect.arrayContaining([
						{ name: "Status", value: "Accepted", inline: true },
					]),
				}),
			],
			components: [],
		});
	});

	test("updates embed to declined", async () => {
		await suggestionEvent.execute({
			...interaction,
			customId: "suggestion-decline",
		});

		expect(interaction.update).toHaveBeenCalledWith({
			embeds: [
				expect.objectContaining({
					fields: expect.arrayContaining([
						{ name: "Status", value: "Declined", inline: true },
					]),
				}),
			],
			components: [],
		});
	});

	test("returns if it's not a button", async () => {
		interaction.isButton.mockReturnValueOnce(false);

		await suggestionEvent.execute(interaction);

		expect(interaction.isButton).toHaveBeenCalled();
		expect(interaction.update).not.toHaveBeenCalled();
	});

	test("returns if it's not a valid customId", async () => {
		await suggestionEvent.execute(interaction);

		expect(interaction.update).not.toHaveBeenCalled();
	});

	test("returns there's no embed", async () => {
		await suggestionEvent.execute({
			...interaction,
			customId: "suggestion-accept",
			message: {
				embeds: [],
			},
		});

		expect(interaction.update).not.toHaveBeenCalled();
	});

	test("logs errors to console", async () => {
		const error = new Error("error");

		// really don't like how this is done
		interaction.isButton.mockImplementationOnce(() => {
			throw error;
		});
		jest.spyOn(console, "error").mockImplementation();

		await suggestionEvent.execute(interaction);

		expect(console.error).toHaveBeenCalledWith(error);
	});
});
