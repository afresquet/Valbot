import { Query } from "mongoose";
import { isPromise } from "util/types";
import type { Pipeline } from "./pipeline";

export default class PipelineBuilder<Input, Current, Context, Global>
	implements Pipeline.PipelineBuilder<Input, Current, Context, Global>
{
	fns: Pipeline.Pipeline<any, any, Context, Global>[] = [];

	pipe<Next>(
		fn: Pipeline.Pipeline<Current, Next, Context, Global>
	): PipelineBuilder<Input, Next, Context, Global> {
		this.fns.push(fn);

		return this as unknown as PipelineBuilder<Input, Next, Context, Global>;
	}

	pipeline(): Pipeline.Pipeline<Input, Current, Context, Global> {
		const composition: Pipeline.Pipeline<Input, Current, Context, Global> =
			this.fns.reduce((fn1, fn2) => (value, localContext, globalContext) => {
				const res = fn1(value, localContext, globalContext);

				if (isPromise(res) || res instanceof Query) {
					return (res as Promise<any>).then(r =>
						fn2(r, localContext, globalContext)
					);
				}

				return fn2(res, localContext, globalContext);
			});

		return (value, localContext, globalContext) =>
			composition(value, localContext, globalContext);
	}
}
