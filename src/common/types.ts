export interface BufferMetadata {
	[key:string | number | symbol]: {
		size: number;
	};
}

export type Encoding = "utf8" | "ascii" | "base64" | "hex";