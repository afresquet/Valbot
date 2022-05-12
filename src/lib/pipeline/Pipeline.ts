import { Query } from "mongoose";
import { isPromise } from "util/types";
import type { Pipeline as TPipeline } from "./pipeline";

export default class PipelineBuilder<T, V, C>
	implements TPipeline.PipelineBuilder<T, V, C>
{
	fns: TPipeline.Step<any | Promise<any>, any | Promise<any>, C>[] = [];

	pipe<R>(fn: TPipeline.Step<V, R, C>): PipelineBuilder<T, R, C> {
		this.fns.push(fn);

		return this as unknown as PipelineBuilder<T, R, C>;
	}

	build(): TPipeline.Pipeline<T, V, C> {
		const composition: TPipeline.Step<T, any | Promise<any>, C> =
			this.fns.reduce((fn1, fn2) => (value: T, context: C) => {
				const res = fn1(value, context);

				if (isPromise(res) || res instanceof Query) {
					return (res as Promise<any>).then(r => fn2(r, context));
				}

				return fn2(res, context);
			});

		return (value, context) => composition(value, context);
	}

	step<U, R>(): TPipeline.Step<U, R, C> {
		return this.build() as unknown as TPipeline.Step<U, R, C>;
	}
}
