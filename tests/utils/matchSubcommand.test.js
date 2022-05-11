const {
	matchSubcommand,
	matchSubcommandStep,
} = require("../../src/utils/matchSubcommand");

describe("matchSubcommand utils", () => {
	const subcommand = "subcommand";
	const interaction = {
		options: {
			getSubcommand: jest.fn(() => subcommand),
		},
	};

	describe("matchSubcommand", () => {
		test("returns true if the subcommand matches", () => {
			const result = matchSubcommand(subcommand)(interaction);

			expect(result).toBe(true);
		});

		test("returns false if the subcommand matches", () => {
			const result = matchSubcommand("not_a_subcommand")(interaction);

			expect(result).toBe(false);
		});
	});

	describe("matchSubcommandStep", () => {
		test("returns true if the subcommand matches", () => {
			const result = matchSubcommandStep(subcommand)(undefined, interaction);

			expect(result).toBe(true);
		});

		test("returns false if the subcommand matches", () => {
			const result = matchSubcommandStep("not_a_subcommand")(
				undefined,
				interaction
			);

			expect(result).toBe(false);
		});
	});
});
