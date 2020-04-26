export class Queue<T> {
	constructor(private queue: T[] = []) {}

	get array(): T[] {
		return this.queue;
	}

	get isEmpty() {
		return this.queue.length === 0;
	}

	enqueue(element: T) {
		this.queue.push(element);
	}

	dequeue(): T | undefined {
		return this.queue.shift();
	}

	remove(index: number) {
		this.queue.splice(index, 1);
	}

	clear() {
		this.queue.length === 0;
	}
}
