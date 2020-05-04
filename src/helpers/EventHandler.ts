type Listener<T> = { name: keyof T; callback: T[keyof T] };
export class EventHandler<
	Events extends { [K in keyof Events]: (...args: any[]) => void }
> {
	private id = 0;

	private listeners = new Map<number, Listener<Events>>();

	listen<T extends keyof Events>(name: T, callback: Events[T]): number {
		this.listeners.set(this.id, { name, callback });

		return this.id++;
	}

	unlisten(id: number | undefined) {
		if (id) {
			this.listeners.delete(id);
		}
	}

	emit<T extends keyof Events>(name: T, ...args: Parameters<Events[T]>) {
		this.listeners.forEach(listener => {
			if (listener.name === name) {
				listener.callback(...args);
			}
		});
	}

	clear() {
		this.listeners.clear();

		this.id = 0;
	}
}
