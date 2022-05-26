const { customId } = require("../steps/customId");

describe("customId step", () => {
	const validIds = ["a", "b", "c"];
	const context = {
		Errors: {
			Exit: jest.fn(),
		},
	};

	test("does not throw an error if the id is valid", () => {
		const event = {
			interaction: {
				customId: "a",
			},
		};

		expect(() =>
			customId(...validIds)(undefined, event, context)
		).not.toThrow();
		expect(context.Errors.Exit).not.toHaveBeenCalled();
	});

	test("throws an error if the id isn't valid", () => {
		const event = {
			interaction: {
				customId: "d",
			},
		};

		expect(() => customId(...validIds)(undefined, event, context)).toThrow();
		expect(context.Errors.Exit).toHaveBeenCalled();
	});
});
