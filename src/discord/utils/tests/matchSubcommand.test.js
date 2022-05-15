const { matchSubcommand } = require("../matchSubcommand");

describe("matchSubcommand util", () => {
	const subcommand = "subcommand";
	const context = {
		interaction: {
			options: {
				getSubcommand: jest.fn(() => subcommand),
			},
		},
	};

	test("returns true if the subcommand matches", () => {
		const result = matchSubcommand(subcommand, context.interaction);

		expect(result).toBe(true);
	});

	test("returns false if the subcommand matches", () => {
		const result = matchSubcommand("not_a_subcommand", context.interaction);

		expect(result).toBe(false);
	});
});
