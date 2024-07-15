import { BUFFER_METADATA_KEY, ENDIANNESS_METADATA_KEY, JSON_METADATA_KEY } from "./common/constants";
import { BufferMetadata } from "./common/types";
import { defineGetters, defineMetadata, getMetadata } from "./common/utils";
import { DeSer } from "./deser";

export function endianness(endiannessOption: 'big' | 'little') {
	return function (constructor: typeof DeSer) {
		defineMetadata(ENDIANNESS_METADATA_KEY, endiannessOption, constructor);
	}
}

export function json() {
	return function <T extends DeSer>(target: T, propertyKey: string) {
		const jsonMetadata = getMetadata(JSON_METADATA_KEY, target) || {};
		jsonMetadata[propertyKey] = {};
		defineMetadata(JSON_METADATA_KEY, jsonMetadata, target);
	}
}

export function buffer() {
	return function <T extends DeSer>(target: T, propertyKey: keyof T) {
		const bufferMetadata: BufferMetadata = getMetadata(BUFFER_METADATA_KEY, target) || {};
		defineGetters(target, propertyKey);

		bufferMetadata[propertyKey] = {
			get bitSize() {
				const value = target[propertyKey];
				if (typeof value === "number") {
					return 8 * 8;
				} else if (typeof value === "boolean") {
					return 1;
				} else if (typeof value === "string") {
					return value.length * 8;
				} else if (typeof value === "symbol") {
					return (value.description ?? '').length * 8;
				} else if (value instanceof DeSer) {
					return value.sizeOf() * 8 + (4 * 8);
				} else if (value instanceof ArrayBuffer) {
					return value.byteLength * 8 + (4 * 8);
				}
				return JSON.stringify(value).length * 8;
			}
		};
		defineMetadata(BUFFER_METADATA_KEY, bufferMetadata, target);
	}
}