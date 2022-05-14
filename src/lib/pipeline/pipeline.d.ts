export declare namespace Pipeline {
	interface Pipeline<Value, Result, Context, Global> {
		(value: Value, context: Context, global: Global): Result | Promise<Result>;
	}

	interface PipelineBuilder<Input, Current, Context, Global> {
		fns: Pipeline<any, any, Context, Global>[];

		pipe<Next>(
			pipeline: Pipeline<Current, Next, Context, Global>
		): PipelineBuilder<Input, Next, Context, Global>;

		done(): Pipeline<Input, Current, Context, Global>;
	}
}
