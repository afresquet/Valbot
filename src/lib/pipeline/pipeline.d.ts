export declare namespace Pipeline {
	interface Step<V, R, C> {
		(value: V, context: C): R | PromiseLike<R>;
	}

	interface Pipeline<T, V, C> {
		fns: Step<any | PromiseLike<any>, any | PromiseLike<any>, C>[];

		pipe: <R>(step: Step<V, R, C>) => Pipeline<T, R, C>;

		run: (value: T, context: C) => V | PromiseLike<V>;
	}
}
