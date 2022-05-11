import { isPromise } from "util/types";
import type { Pipeline as TPipeline } from "./pipeline";

export default class Pipeline<T, V, C> implements TPipeline.Pipeline<T, V, C> {
	fns: TPipeline.Step<any | PromiseLike<any>, any | PromiseLike<any>, C>[] = [];

	pipe<R>(fn: TPipeline.Step<V, R, C>): Pipeline<T, R, C> {
		this.fns.push(fn);

		return this as unknown as Pipeline<T, R, C>;
	}

	run(value: T, context: C): V | PromiseLike<V> {
		const composition: TPipeline.Step<T, any | PromiseLike<any>, C> =
			this.fns.reduce((fn1, fn2) => (value: T, context: C) => {
				const res = fn1(value, context);

				if (isPromise(res)) {
					return (res as PromiseLike<any>).then(r => fn2(r, context));
				}

				return fn2(res, context);
			});

		return composition(value, context);
	}
}
