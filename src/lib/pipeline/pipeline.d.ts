export declare namespace Pipeline {
	interface Pipeline<T, V, C> {
		(value: T, context: C): V | Promise<V>;
	}

	interface Step<V, R, C> {
		(value: V, context: C): R | Promise<R>;
	}

	interface PipelineBuilder<T, V, C> {
		fns: Step<any | Promise<any>, any | Promise<any>, C>[];

		pipe<R>(step: Step<V, R, C>): PipelineBuilder<T, R, C>;

		build(): Pipeline<T, V, C>;

		step<R>(): Step<V, R, C>;
	}
}
