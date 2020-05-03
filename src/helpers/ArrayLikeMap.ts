export class ArrayLikeMap<K, V> extends Map<K, V> {
	getByIndex(index: number): V | undefined {
		return Array.from(this.values())[index];
	}

	indexOf(value: V): number {
		return Array.from(this.values()).indexOf(value);
	}

	forEachWithIndex(
		callback: (value: V, key: K, index: number, map: ArrayLikeMap<K, V>) => void
	) {
		Array.from(this).forEach(([key, value], index) => {
			callback(value, key, index, this);
		});
	}

	find(
		callback: (value: V, index: number, map: ArrayLikeMap<K, V>) => boolean
	): V | undefined {
		return Array.from(this.values()).find((value, index) => {
			return callback(value, index, this);
		});
	}

	map<T>(
		callback: (value: V, key: K, index: number, map: ArrayLikeMap<K, V>) => T
	): T[] {
		return Array.from(this).map(([key, value], index) => {
			return callback(value, key, index, this);
		});
	}

	filter(
		callback: (value: V, index: number, map: ArrayLikeMap<K, V>) => boolean
	): V[] {
		return Array.from(this.values()).filter((value, index) => {
			return callback(value, index, this);
		});
	}

	reduce<T>(
		callback: (
			previous: T,
			value: V,
			key: K,
			index: number,
			map: ArrayLikeMap<K, V>
		) => T,
		initialValue: T
	): T {
		return Array.from(this).reduce<T>((previous, [key, value], index) => {
			return callback(previous, value, key, index, this);
		}, initialValue);
	}
}
