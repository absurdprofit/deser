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
		enumerable: true,
		configurable: false
	});
}

export function coerceToArrayBuffer(value: ArrayBuffer | DeSer) {
	if (value instanceof ArrayBuffer) {
		return value;
	} else {
		return value.toBuffer();
	}
}

const METADATA_REGISTRY = new WeakMap();
export function defineMetadata(key: string | number | symbol, value: any, target: object) {
	const existingMetadata = METADATA_REGISTRY.get(target) ?? {};
	existingMetadata[key] = value;
	METADATA_REGISTRY.set(target, existingMetadata);
}

export function getMetadata(key: string | number | symbol, target: object) {
	return METADATA_REGISTRY.get(target)?.[key];
}