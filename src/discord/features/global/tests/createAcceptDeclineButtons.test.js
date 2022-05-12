const {
	createAcceptDeclineButtons,
} = require("../../global/steps/createAcceptDeclineButtons");

describe("custom-pipelines lib createAcceptDeclineButtons step", () => {
	const customId = "customId";

	test("creates a suggestion embed", () => {
		const result = createAcceptDeclineButtons(customId)(undefined, undefined);

		expect(result).toStrictEqual(
			expect.objectContaining({
				components: expect.arrayContaining([
					expect.objectContaining({
						type: "BUTTON",
						label: "✅ Accept",
						customId: `${customId}-accept`,
					}),
					expect.objectContaining({
						type: "BUTTON",
						label: "⛔ Decline",
						customId: `${customId}-decline`,
					}),
				]),
			})
		);
	});
});
