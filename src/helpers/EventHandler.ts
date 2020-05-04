export class EventHandler<
	N extends string,
	C extends (...args: any[]) => void
> {
	private id = 0;

	private listeners = new Map<number, { name: N; callback: C }>();

	listen(name: N, callback: C): number {
		this.listeners.set(this.id, { name, callback });

		return this.id++;
	}

	unlisten(id: number | undefined) {
		if (id) {
			this.listeners.delete(id);
		}
	}

	clear() {
		this.listeners.clear();

		this.id = 0;
	}

	emit(name: N, ...args: any[]) {
		this.listeners.forEach(listener => {
			if (listener.name === name) {
				listener.callback(...args);
			}
		});
	}
}
