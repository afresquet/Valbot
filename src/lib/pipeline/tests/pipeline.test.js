const PipelineBuilder = require("../Pipeline").default;

describe("pipeline lib PipelineBuilder", () => {
	const functions = [
		jest.fn(x => x + 1),
		jest.fn(x => x * 2),
		jest.fn(x => x.toString()),
	];
	const localContext = { foo: "bar" };
	const globalContext = { bar: "foo" };

	beforeEach(jest.clearAllMocks);

	test("stores functions to be composed", () => {
		const pipeline = new PipelineBuilder()
			.pipe(functions[0])
			.pipe(functions[1])
			.pipe(functions[2]);

		expect(pipeline.fns).toStrictEqual(functions);
	});

	test("executes functions in order and passes the contexts", () => {
		const pipeline = new PipelineBuilder()
			.pipe(functions[0])
			.pipe(functions[1])
			.pipe(functions[2])
			.pipeline();

		const result = pipeline(1, localContext, globalContext);

		expect(result).toBe("4");

		expect(functions[0]).toHaveBeenCalledWith(1, localContext, globalContext);
		expect(functions[1]).toHaveBeenCalledWith(2, localContext, globalContext);
		expect(functions[2]).toHaveBeenCalledWith(4, localContext, globalContext);
	});

	test("can be nested", () => {
		const pipeline = new PipelineBuilder()
			.pipe(functions[0])
			.pipe(new PipelineBuilder().pipe(functions[1]).pipeline())
			.pipe(functions[2])
			.pipeline();

		const result = pipeline(1, localContext, globalContext);

		expect(result).toBe("4");

		expect(functions[0]).toHaveBeenCalledWith(1, localContext, globalContext);
		expect(functions[1]).toHaveBeenCalledWith(2, localContext, globalContext);
		expect(functions[2]).toHaveBeenCalledWith(4, localContext, globalContext);
	});

	test("works with promises", () => {
		const fn = jest.fn(async x => x * 2);

		const pipeline = new PipelineBuilder()
			.pipe(functions[0])
			.pipe(fn)
			.pipe(functions[2])
			.pipeline();

		const result = pipeline(1, localContext, globalContext);

		expect(result).resolves.toBe("4");
	});
});
