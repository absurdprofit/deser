import { BitStream } from "bit-buffer";
import { BUFFER_METADATA_KEY, ENDIANNESS_METADATA_KEY } from "./common/constants";
import { BufferMetadata } from "./common/types";
import { coerceToArrayBuffer } from "./common/utils";

export abstract class DeSer {
	public static fromBuffer<T extends DeSer>(this: new () => T, buffer: ArrayBuffer): T {
		const instance: any = new this();
		const stream = new BitStream(buffer);
		const { endianness } = instance;
		stream.bigEndian = endianness === 'big';
		const propertyMetadata: BufferMetadata = Reflect.getMetadata(BUFFER_METADATA_KEY, instance) ?? {};
		Object.keys(propertyMetadata).forEach((propertyKey) => {
			const type = Reflect.getMetadata("design:type", instance, propertyKey);
			switch (type) {
				case Number:
					instance[propertyKey] = stream.readFloat64();
					break;
				case Boolean:
					instance[propertyKey] = stream.readBoolean();
					break;
				case String:
					instance[propertyKey] = stream.readUTF8String();
					break;
				case Symbol:
					instance[propertyKey] = Symbol(stream.readUTF8String());
					break;
				case Object:
					instance[propertyKey] = JSON.parse(stream.readUTF8String());
					break;
				default:
					if (type.prototype instanceof DeSer) {
						instance[propertyKey] = type.fromBuffer(stream.readArrayBuffer(stream.readUint32()).buffer);
					} else if (type === ArrayBuffer)
						instance[propertyKey] = stream.readArrayBuffer(stream.readUint32()).buffer;

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
				case Object:
					stream.writeUTF8String(JSON.stringify(value));
					break;
				default:
					if (value instanceof ArrayBuffer || value instanceof DeSer) {
						const buffer = coerceToArrayBuffer(value);
						stream.writeUint32(buffer.byteLength);
						stream.writeArrayBuffer(buffer as any);
					} else
						throw new TypeError(`Unsupported type '${typeof value}' for property '${propertyKey}'`);
			}
		});
		return buffer;
	}

	// public toJSON(): string {
	// 	throw new Error('Not implemented');
	// }

	public sizeOf(): number {
		const propertyMetadata: BufferMetadata = Reflect.getMetadata(BUFFER_METADATA_KEY, this) ?? {};
		const sizeInBits = Object.values(propertyMetadata).reduce((bitSize, metadata) => {
			return bitSize + metadata.bitSize;
		}, 0);

		return Math.ceil(sizeInBits / 8);
	}

	public get endianness(): 'big' | 'little' {
		return Reflect.getMetadata(ENDIANNESS_METADATA_KEY, this.constructor) ?? 'little';
	}
}