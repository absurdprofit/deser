import "reflect-metadata";
import { buffer, endianness, json } from "./decorators";
import { DeSer } from "./deser";


export * from './decorators';
export * from './deser';

enum TestEnum {
	ONE = 1,
	TWO = 2,
	THREE = 3
}

class Serialisable2 extends DeSer {
	@json()
	@buffer()
	public flag: boolean = false;
}

const uint8array = new Uint8Array(new ArrayBuffer(10));
for (let i = 0; i < uint8array.byteLength; i++) {
	uint8array[i] = i;
}
@endianness('big')
class Serialisable extends DeSer {
	@json()
	@buffer()
	public flag: boolean = true;
	@json()
	@buffer()
	public id: number = 50;
	@json()
	@buffer()
	public name: string = 'Nathan';
	@json()
	@buffer()
	public symbol: symbol = Symbol('test');
	@json()
	@buffer()
	public nested: Serialisable2 = new Serialisable2();
	@json()
	@buffer()
	public enumField: TestEnum = TestEnum.ONE;
	@json()
	@buffer()
	public unionField: 'a' | 'b' = 'a';
	@json()
	@buffer()
	public exclusiveUnionField: number | string = 5;
	@json()
	@buffer()
	public buffer: ArrayBuffer = uint8array.buffer;
}


class SerialisableJSON extends DeSer {
	public flag: boolean = true;
	public id: number = 50;
	public name: string = 'Nathan';
	public symbol: symbol = Symbol('test');
	public nested: Serialisable2 = new Serialisable2();
	public enumField: TestEnum = TestEnum.ONE;
	public unionField: 'a' | 'b' = 'a';
	public exclusiveUnionField: number | string = 5;
	public buffer: ArrayBuffer = uint8array.buffer;
}
export { Serialisable, SerialisableJSON };