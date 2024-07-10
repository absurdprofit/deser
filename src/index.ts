import "reflect-metadata";
import { buffer, endianness, json } from "./decorators";
import { DeSer } from "./deser";


export * from './decorators';
export * from './deser';

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
}

const serialisable = new Serialisable();
eval('import("fs")').then((fs: any) => {
	fs.writeFileSync('serialisable.bin', Buffer.from(serialisable.toBuffer()));
	const buffer = fs.readFileSync('serialisable.bin');
	const deserialised = Serialisable.fromBuffer(buffer.buffer);
	console.log(deserialised["name"]);
	console.log(deserialised["id"]);
	console.log(deserialised["flag"]);

})
	