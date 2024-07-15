export interface BufferMetadata {
	[key: string | number | symbol]: {
		bitSize: number;
	};
}

export type Encoding = "utf8" | "ascii" | "base64" | "hex";

export function isDeSerConstructor(value: any) {
	return typeof value === "function";
}