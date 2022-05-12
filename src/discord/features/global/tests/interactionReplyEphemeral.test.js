const {
	interactionReplyEphemeral,
} = require("../../global/steps/interactionReplyEphemeral");

describe("custom-pipelines lib interactionReplyEphemeral step", () => {
	const interaction = {
		reply: jest.fn(async () => {}),
	};

	test("replies with ephemeral set to true", async () => {
		const message = "message";

		await interactionReplyEphemeral(message, { interaction });

		expect(interaction.reply).toHaveBeenCalledWith({
			content: message,
			ephemeral: true,
		});
	});
});
