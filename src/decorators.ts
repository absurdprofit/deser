import { BUFFER_METADATA_KEY, ENDIANNESS_METADATA_KEY, JSON_METADATA_KEY } from "./common/constants";
import { BufferMetadata } from "./common/types";
import { defineGetters } from "./common/utils";
import { DeSer } from "./deser";

export function endianness(endiannessOption: 'big' | 'little') {
	return function (constructor: typeof DeSer) {
		Reflect.defineMetadata(ENDIANNESS_METADATA_KEY, endiannessOption, constructor);
	}
}

export function json() {
	return function <T extends DeSer>(target: T, propertyKey: string) {
		const jsonMetadata = Reflect.getMetadata(JSON_METADATA_KEY, target) || {};
		jsonMetadata[propertyKey] = {};
		Reflect.defineMetadata(JSON_METADATA_KEY, jsonMetadata, target);
	}
}

export function buffer() {
	return function <T extends DeSer>(target: T, propertyKey: keyof T) {
		const bufferMetadata: BufferMetadata = Reflect.getMetadata(BUFFER_METADATA_KEY, target) || {};
		defineGetters(target, propertyKey);

		bufferMetadata[propertyKey] = {
			get size() {
				const value = Reflect.get(target, propertyKey);
				if (typeof value === "number") {
					return 8;
				} else if (typeof value === "boolean") {
					return 1;
				} else if (typeof value === "string") {
					return value.length * 8;
				}
				return 0;
			}
		};
		Reflect.defineMetadata(BUFFER_METADATA_KEY, bufferMetadata, target);
	}
}