import { DeSer } from "../deser";

export interface BufferMetadata {
	[key: string | number | symbol]: {
		bitSize: number;
		type: Number | Boolean | String | Object | Symbol | ArrayBuffer | DeSerDerived<any>;
		options: BufferOptions;
	};
}

export type DeSerDerived<T extends DeSer> = T;

export type Encoding = "utf8" | "ascii" | "base64" | "hex";
export type BufferStringEncoding = "utf8" | "ascii";

export interface BufferStringOptions {
	encoding?: BufferStringEncoding;
}

export interface BufferNumberOptions {
	bits?: number;
}

export type BufferOptions = BufferNumberOptions | BufferStringOptions;

export function isDeSerConstructor(value: any) {
	return typeof value === "function";
}