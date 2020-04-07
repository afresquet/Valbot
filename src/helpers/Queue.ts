export class Queue<T> {
	queue: T[];

	constructor(initialQueue: T[]) {
		this.queue = initialQueue;
	}

	get current() {
		return this.queue;
	}

	get isEmpty() {
		return this.queue.length === 0;
	}

	enqueue(element: T) {
		this.queue = [...this.queue, element];
	}

	dequeue() {
		const [element, ...newQueue] = this.queue;

		this.queue = newQueue;

		return element;
	}

	remove(index: number) {
		this.queue = this.queue.filter((_, i) => i !== index);
	}

	clear() {
		this.queue.length === 0;
	}
}
