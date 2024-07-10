import { DeSer } from "../deser";

export function defineGetters<T extends DeSer>(target: T, propertyKey: keyof T) {
	let value: any;

	Object.defineProperty(target, propertyKey, {
		get() {
			return value;
		},
		set(_value) {
			value = _value;
		},
		enumerable: false,
		configurable: false
	});
}