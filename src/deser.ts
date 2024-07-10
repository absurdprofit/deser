import { BitView } from "bit-buffer";
import { BUFFER_METADATA_KEY, ENDIANNESS_METADATA_KEY } from "./common/constants";

export abstract class DeSer {
	public static fromBuffer<T extends DeSer>(this: new () => T, buffer: ArrayBuffer): T {
		throw new Error('Not implemented');
	}

	public static fromJSON<T extends DeSer>(this: new () => T, json: string): T {
		throw new Error('Not implemented');
	}

	public toBuffer(): ArrayBuffer {
		const buffer = new ArrayBuffer(this.sizeOf());
		const view = new BitView(buffer);
		const { endianness } = this;
		view.bigEndian = endianness === 'big';
		console.log(Reflect.getMetadata(BUFFER_METADATA_KEY, this));
		return buffer;
	}

	public toJSON(): string {
		throw new Error('Not implemented');
	}

	public sizeOf(): number {
		return 0;
	}

	public get endianness(): 'big' | 'little' {
		return Reflect.getMetadata(ENDIANNESS_METADATA_KEY, this.constructor) ?? 'little';
	}
}