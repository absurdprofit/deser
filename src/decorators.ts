import { BUFFER_METADATA_KEY, ENDIANNESS_METADATA_KEY, JSON_METADATA_KEY } from "./common/constants";
import { DeSer } from "./deser";

export function endianness(endiannessOption: 'big' | 'little') {
	return function (constructor: typeof DeSer) {
		console.log({constructor})
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
	return function <T extends DeSer>(target: T, propertyKey: string) {
		const bufferMetadata = Reflect.getMetadata(BUFFER_METADATA_KEY, target) || {};
		bufferMetadata[propertyKey] = {};
		Reflect.defineMetadata(BUFFER_METADATA_KEY, bufferMetadata, target);
	}
}