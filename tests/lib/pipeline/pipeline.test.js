const Pipeline = require("../../../src/lib/pipeline/Pipeline").default;

describe("Pipeline lib", () => {
	const functions = [
		jest.fn(x => x + 1),
		jest.fn(x => x * 2),
		jest.fn(x => x.toString()),
	];
	const context = { foo: "bar" };

	beforeEach(jest.clearAllMocks);

	test("it stores functions to be composed", () => {
		const pipeline = new Pipeline()
			.pipe(functions[0])
			.pipe(functions[1])
			.pipe(functions[2]);

		expect(pipeline.fns).toStrictEqual(functions);
	});

	test("it executes functions in order and passes the context", () => {
		const pipeline = new Pipeline()
			.pipe(functions[0])
			.pipe(functions[1])
			.pipe(functions[2]);

		const result = pipeline.run(1, context);

		expect(result).toBe("4");

		expect(functions[0]).toHaveBeenCalledWith(1, context);
		expect(functions[1]).toHaveBeenCalledWith(2, context);
		expect(functions[2]).toHaveBeenCalledWith(4, context);
	});

	test("it works with promises", () => {
		const fn = jest.fn(async x => x * 2);

		const pipeline = new Pipeline()
			.pipe(functions[0])
			.pipe(fn)
			.pipe(functions[2]);

		const result = pipeline.run(1, context);

		expect(result).resolves.toBe("4");
	});
});
