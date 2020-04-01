type GetState<T> = () => T;

type SetState<T> = (callback: (previousState: T) => T) => void;

export const useState = <T>(initalState: T): [GetState<T>, SetState<T>] => {
	let state = initalState;

	const getState: GetState<T> = () => state;

	const setState: SetState<T> = callback => {
		state = callback(state);
	};

	return [getState, setState];
};
