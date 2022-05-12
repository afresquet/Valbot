const {
	matchSubcommand,
	matchSubcommandStep,
} = require("../../src/utils/matchSubcommand");

describe("matchSubcommand utils", () => {
	const subcommand = "subcommand";
	const context = {
		interaction: {
			options: {
				getSubcommand: jest.fn(() => subcommand),
			},
		},
	};

	describe("matchSubcommand", () => {
		test("returns true if the subcommand matches", () => {
			const result = matchSubcommand(subcommand)(context.interaction);

			expect(result).toBe(true);
		});

		test("returns false if the subcommand matches", () => {
			const result = matchSubcommand("not_a_subcommand")(context.interaction);

			expect(result).toBe(false);
		});
	});

	describe("matchSubcommandStep", () => {
		test("returns true if the subcommand matches", () => {
			const result = matchSubcommandStep(subcommand)(undefined, context);

			expect(result).toBe(true);
		});

		test("returns false if the subcommand matches", () => {
			const result = matchSubcommandStep("not_a_subcommand")(
				undefined,
				context
			);

			expect(result).toBe(false);
		});
	});
});
