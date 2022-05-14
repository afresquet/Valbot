export type IsPromise<T> = T extends PromiseLike<any> ? true : false;

export type Persist<T, U> = T extends true ? T : U;

export type IsAsync<T, B> = B extends true ? Promise<T> : T;

export declare namespace Pipeline {
	interface Pipeline<Value, Result, Context, Global> {
		(value: Value, context: Context, global: Global): Result;
	}

	class PipelineBuilder<Input, Current, Context, Global, Async = false> {
		fns: Pipeline<any, any, Context, Global>[];

		pipe<Next, IsAsync = IsPromise<Next>>(
			pipeline: Pipeline<Current, Next, Context, Global>
		): PipelineBuilder<Input, Next, Context, Global, Persist<Async, IsAsync>>;

		compose(): Pipeline<Input, IsAsync<Current, Async>, Context, Global>;

		run(
			value: Input,
			context: Context,
			global: Global
		): IsAsync<Current, Async>;
	}
}
