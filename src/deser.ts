import { BitStream } from "bit-buffer";
import { BUFFER_METADATA_KEY, ENDIANNESS_METADATA_KEY } from "./common/constants";
import { BufferMetadata } from "./common/types";
import { coerceToArrayBuffer, getMetadata } from "./common/utils";

export abstract class DeSer {
	public static fromBuffer<T extends DeSer>(this: new () => T, buffer: ArrayBuffer): T {
		const instance: Record<string, any> = new this();
		const stream = new BitStream(buffer);
		stream.bigEndian = instance.endianness === 'big';
		const propertyMetadata: BufferMetadata = getMetadata(BUFFER_METADATA_KEY, Object.getPrototypeOf(instance)) ?? {};
		for (const propertyKey in propertyMetadata) {
			const metadata = propertyMetadata[propertyKey];
			const type = metadata.type;
			const encoding = 'encoding' in metadata.options ? metadata.options.encoding : 'utf8';
			const bits = 'bits' in metadata.options ? metadata.options.bits : 0;
			switch (type) {
				case Number:
					if (bits)
						instance[propertyKey] = stream.readBits(bits);
					else
						instance[propertyKey] = stream.readFloat64();
					break;
				case Boolean:
					instance[propertyKey] = stream.readBoolean();
					break;
				case String:
				case Symbol: {
					let value;
					if (encoding === "ascii")
						value = stream.readASCIIString(stream.readUint32());
					else
						value = stream.readUTF8String(stream.readUint32());
					if (type === Symbol)
						value = Symbol(value);
					instance[propertyKey] = value;
					break;
				}
				case Object:
					instance[propertyKey] = JSON.parse(stream.readUTF8String(stream.readUint32()));
					break;
				default:
					if ('prototype' in type && type.prototype instanceof DeSer) {
						instance[propertyKey] = type.fromBuffer(stream.readArrayBuffer(stream.readUint32()).buffer);
					} else if (type === ArrayBuffer)
						instance[propertyKey] = stream.readArrayBuffer(stream.readUint32()).buffer;

			}
		}

		return instance as T;
	}

	public static fromJSON<T extends DeSer>(this: new () => T, json: string): T {
		throw new Error('Not implemented');
	}

	public toBuffer(): ArrayBuffer {
		const buffer = new ArrayBuffer(this.sizeOf());
		const stream = new BitStream(buffer);
		stream.bigEndian = this.endianness === 'big';
		const propertyMetadata: BufferMetadata = getMetadata(BUFFER_METADATA_KEY, Object.getPrototypeOf(this)) ?? {};
		for (const propertyKey in propertyMetadata) {
			const metadata = propertyMetadata[propertyKey];
			const value = (this as Record<string, any>)[propertyKey];
			const type = metadata.type;
			const encoding = 'encoding' in metadata.options ? metadata.options.encoding : 'utf8';
			const bits = 'bits' in metadata.options ? metadata.options.bits : 0;
			switch (type) {
				case Number:
					if (bits)
						stream.writeBits(value, bits);
					else
						stream.writeFloat64(value);
					break;
				case Boolean:
					stream.writeBoolean(value);
					break;
				case String:
					stream.writeUint32(value.length);
					if (encoding === 'ascii')
						stream.writeASCIIString(value);
					else
						stream.writeUTF8String(value);
					break;
				case Symbol:
					stream.writeUint32(value.description.length);
					if (encoding === 'ascii')
						stream.writeASCIIString(value.description ?? '');
					else
						stream.writeUTF8String(value.description ?? '');
					break;
				case Object: {
					const json = JSON.stringify(value);
					stream.writeUint32(json.length);
					stream.writeUTF8String(json);
					break;
				}
				default:
					if (value instanceof ArrayBuffer || value instanceof DeSer) {
						const buffer = coerceToArrayBuffer(value);
						stream.writeUint32(buffer.byteLength);
						stream.writeArrayBuffer(buffer as any);
					} else
						throw new TypeError(`Unsupported type '${typeof value}' for property '${propertyKey}'`);
			}
		}
		return buffer;
	}

	// public toJSON(): string {
	// 	throw new Error('Not implemented');
	// }

	public sizeOf(): number {
		const propertyMetadata: BufferMetadata = getMetadata(BUFFER_METADATA_KEY, Object.getPrototypeOf(this)) ?? {};
		const sizeInBits = Object.values(propertyMetadata).reduce((bitSize, metadata) => {
			return bitSize + metadata.bitSize;
		}, 0);

		return Math.ceil(sizeInBits / 8);
	}

	public get endianness(): 'big' | 'little' {
		return getMetadata(ENDIANNESS_METADATA_KEY, this.constructor) ?? 'little';
	}
}