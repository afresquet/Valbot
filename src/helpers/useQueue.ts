interface Queue<T> {
	array: () => T[];
	isEmpty: () => boolean;
	enqueue: (element: T) => void;
	dequeue: () => T;
}

export const useQueue = <T>(initialQueue: T[]): Queue<T> => {
	let queue = initialQueue;

	return {
		array: () => queue,
		isEmpty: () => queue.length === 0,
		enqueue: (element: T) => {
			queue = [...queue, element];
		},
		dequeue: () => {
			const [element, ...newQueue] = queue;

			queue = newQueue;

			return element;
		},
	};
};
