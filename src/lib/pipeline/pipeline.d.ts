export declare namespace Pipeline {
	interface Pipeline<T, V, C> {
		(value: T, context: C): V | PromiseLike<V>;
	}

	interface Step<V, R, C> {
		(value: V, context: C): R | PromiseLike<R>;
	}

	interface PipelineBuilder<T, V, C> {
		fns: Step<any | PromiseLike<any>, any | PromiseLike<any>, C>[];

		pipe: <R>(step: Step<V, R, C>) => PipelineBuilder<T, R, C>;

		build: () => Pipeline<T, V, C>;
	}
}
