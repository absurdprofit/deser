import { BitStream } from "bit-buffer";
import { BUFFER_METADATA_KEY, ENDIANNESS_METADATA_KEY } from "./common/constants";
import { BufferMetadata } from "./common/types";
import { coerceToArrayBuffer } from "./common/utils";

export abstract class DeSer {
	public static fromBuffer<T extends DeSer>(this: new () => T, buffer: ArrayBuffer): T {
		const instance = new this();
		const stream = new BitStream(buffer);
		const { endianness } = instance;
		stream.bigEndian = endianness === 'big';
		const propertyMetadata: BufferMetadata = Reflect.getMetadata(BUFFER_METADATA_KEY, instance) ?? {};
		Object.keys(propertyMetadata).forEach((propertyKey) => {
			const value = Reflect.get(this, propertyKey);
			const type = Reflect.getMetadata("design:type", this, propertyKey);
			if (typeof value === 'number') {
				stream.readFloat64();
			} else if (typeof value === 'boolean') {
				stream.readBoolean();
			} else if (typeof value === 'string') {
				stream.readUTF8String();
			}
		});

		return instance;
	}

	public static fromJSON<T extends DeSer>(this: new () => T, json: string): T {
		throw new Error('Not implemented');
	}

	public toBuffer(): ArrayBuffer {
		const buffer = new ArrayBuffer(this.sizeOf());
		const stream = new BitStream(buffer);
		const { endianness } = this;
		stream.bigEndian = endianness === 'big';
		const propertyMetadata: BufferMetadata = Reflect.getMetadata(BUFFER_METADATA_KEY, this) ?? {};
		Object.keys(propertyMetadata).forEach((propertyKey) => {
			const value = Reflect.get(this, propertyKey) as any;
			const type = Reflect.getMetadata("design:type", this, propertyKey);
			switch (type) {
				case Number:
					stream.writeFloat64(value);
					break;
				case Boolean:
					stream.writeBoolean(value);
					break;
				case String:
					stream.writeUTF8String(value);
					break;
				case Symbol:
					stream.writeUTF8String(value.description ?? '');
					break;
				default:
					if (value instanceof ArrayBuffer || value instanceof DeSer) {
						const buffer = coerceToArrayBuffer(value);
						stream.writeFloat64(buffer.byteLength);
						stream.writeArrayBuffer(buffer as any);
					} else if (typeof value !== 'undefined' && typeof value !== 'function')
						stream.writeUTF8String(JSON.stringify(value));
					else
						throw new TypeError(`Unsupported type '${typeof value}' for property '${propertyKey}'`);
			}
		});
		return buffer;
	}

	public toJSON(): string {
		throw new Error('Not implemented');
	}

	public sizeOf(): number {
		const propertyMetadata: BufferMetadata = Reflect.getMetadata(BUFFER_METADATA_KEY, this) ?? {};
		return Object.values(propertyMetadata).reduce((size, metadata) => {
			return size + metadata.size;
		}, 0);
	}

	public get endianness(): 'big' | 'little' {
		return Reflect.getMetadata(ENDIANNESS_METADATA_KEY, this.constructor) ?? 'little';
	}
}