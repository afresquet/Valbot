const {
	createSuggestionEmbed,
} = require("../../../../src/commands/suggestions/steps/createEmbed");

describe("suggestion command createEmbed step", () => {
	const type = "Command";
	const suggestion = "Suggestion";
	const avatarUrl = "avatarUrl";
	const interaction = {
		options: {
			getString: jest.fn(str => (str === "type" ? type : suggestion)),
		},
		user: {
			username: "username",
			displayAvatarURL: jest.fn(() => avatarUrl),
		},
	};

	test("creates a suggestion embed", () => {
		const result = createSuggestionEmbed(undefined, { interaction });

		expect(interaction.options.getString).toHaveBeenCalledTimes(2);
		expect(result).toStrictEqual(
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
			})
		);
	});
});
