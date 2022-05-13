export declare namespace Pipeline {
	interface Pipeline<Value, ReturnValue, Context, GlobalContext> {
		(value: Value, localContext: Context, globalContext: GlobalContext):
			| ReturnValue
			| Promise<ReturnValue>;
	}

	interface Step<Value, NextValue, Context, GlobalContext> {
		(value: Value, localContext: Context, globalContext: GlobalContext):
			| NextValue
			| Promise<NextValue>;
	}

	interface PipelineBuilder<InitialValue, Value, LocalContext, GlobalContext> {
		fns: Step<
			any | Promise<any>,
			any | Promise<any>,
			LocalContext,
			GlobalContext
		>[];

		pipe<NextValue>(
			step: Step<Value, NextValue, LocalContext, GlobalContext>
		): PipelineBuilder<InitialValue, NextValue, LocalContext, GlobalContext>;

		build(): Pipeline<InitialValue, Value, LocalContext, GlobalContext>;

		step<NextValue>(): Step<Value, NextValue, LocalContext, GlobalContext>;
	}
}
