const { CommandModel } = require("../schemas/Command");
const { getCommand } = require("../steps/getCommand");

describe("getCommand step", () => {
	const command = { message: "message" };
	const value = "command";
	const event = { channel: "#channel" };

	test("returns a db command", () => {
		jest.spyOn(CommandModel, "findOne").mockReturnValue(command);

		const result = getCommand(value, event);

		expect(result).toBe(command);
		expect(CommandModel.findOne).toHaveBeenCalledWith({
			channel: event.channel,
			name: value,
		});
	});
});
