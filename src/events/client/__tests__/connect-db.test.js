const mongoose = require("mongoose");
const connectDBEvent = require("../connect-db").default;

describe("connect-db client event", () => {
	const uri = "mongo_uri";
	process.env.MONGODB_URI = uri;

	test("connects to the database", async () => {
		jest.spyOn(mongoose, "connect").mockImplementationOnce(() => {});
		jest.spyOn(console, "log");

		await connectDBEvent.execute();

		expect(mongoose.connect).toHaveBeenCalledWith(uri);
		expect(console.log).toHaveBeenCalledWith("Connecting to database...");
		expect(console.log).toHaveBeenCalledWith("Connected to database!");
	});
});
