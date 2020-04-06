type State<T> = [() => T, (callback: (currentState: T) => T) => void];

export const useState = <T>(initalState: T): State<T> => {
	let state = initalState;

	const getState = () => state;

	const setState = (callback: (currentState: T) => T) => {
		state = callback(state);
	};

	return [getState, setState];
};
