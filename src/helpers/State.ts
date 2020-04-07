export class State<T> {
	state: T;

	constructor(initialState: T) {
		this.state = initialState;
	}

	get current() {
		return this.state;
	}

	set(callback: (currentState: T) => T) {
		this.state = callback(this.state);
	}
}
