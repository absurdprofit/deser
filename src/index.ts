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
	public buffer: ArrayBuffer = new ArrayBuffer(10);
}

const serialisable = new Serialisable();
serialisable.toBuffer();