import { Query } from "mongoose";
import { isPromise } from "util/types";
import type { Pipeline } from "./pipeline";

export default class PipelineBuilder<
	InitialValue,
	Value,
	LocalContext,
	GlobalContext
> implements
		Pipeline.PipelineBuilder<InitialValue, Value, LocalContext, GlobalContext>
{
	fns: Pipeline.Step<any, any, LocalContext, GlobalContext>[] = [];

	pipe<NextValue>(
		fn: Pipeline.Step<Value, NextValue, LocalContext, GlobalContext>
	): PipelineBuilder<InitialValue, NextValue, LocalContext, GlobalContext> {
		this.fns.push(fn);

		return this as unknown as PipelineBuilder<
			InitialValue,
			NextValue,
			LocalContext,
			GlobalContext
		>;
	}

	pipeline(): Pipeline.Pipeline<
		InitialValue,
		Value,
		LocalContext,
		GlobalContext
	> {
		const composition: Pipeline.Step<
			InitialValue,
			Value,
			LocalContext,
			GlobalContext
		> = this.fns.reduce((fn1, fn2) => (value, localContext, globalContext) => {
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

	step<StepValue, ReturnValue>(): Pipeline.Step<
		StepValue,
		ReturnValue,
		LocalContext,
		GlobalContext
	> {
		return this.pipeline() as unknown as Pipeline.Step<
			StepValue,
			ReturnValue,
			LocalContext,
			GlobalContext
		>;
	}
}
