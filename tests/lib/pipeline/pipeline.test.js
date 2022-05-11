const PipelineBuilder = require("../../../src/lib/pipeline/Pipeline").default;

describe("pipeline lib PipelineBuilder", () => {
	const functions = [
		jest.fn(x => x + 1),
		jest.fn(x => x * 2),
		jest.fn(x => x.toString()),
	];
	const context = { foo: "bar" };

	beforeEach(jest.clearAllMocks);

	test("stores functions to be composed", () => {
		const pipeline = new PipelineBuilder()
			.pipe(functions[0])
			.pipe(functions[1])
			.pipe(functions[2]);

		expect(pipeline.fns).toStrictEqual(functions);
	});

	test("executes functions in order and passes the context", () => {
		const pipeline = new PipelineBuilder()
			.pipe(functions[0])
			.pipe(functions[1])
			.pipe(functions[2])
			.build();

		const result = pipeline(1, context);

		expect(result).toBe("4");

		expect(functions[0]).toHaveBeenCalledWith(1, context);
		expect(functions[1]).toHaveBeenCalledWith(2, context);
		expect(functions[2]).toHaveBeenCalledWith(4, context);
	});

	test("works with promises", () => {
		const fn = jest.fn(async x => x * 2);

		const pipeline = new PipelineBuilder()
			.pipe(functions[0])
			.pipe(fn)
			.pipe(functions[2])
			.build();

		const result = pipeline(1, context);

		expect(result).resolves.toBe("4");
	});
});
