import "reflect-metadata";
import { buffer, endianness, json } from "./decorators";
import { DeSer } from "./deser";


export * from './decorators';
export * from './deser';

@endianness('big')
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
}

const serialisable = new Serialisable();
eval('import("fs")').then((fs: any) => {
	fs.writeFileSync('serialisable.bin', Buffer.from(serialisable.toBuffer()));
})
	