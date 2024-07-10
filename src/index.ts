import { buffer, endianness, json } from "./decorators";
import { DeSer } from "./deser";
import "reflect-metadata";

@endianness('big')
class Serialisable extends DeSer {
	@json()
	@buffer()
	public flag: boolean = false;
	@json()
	@buffer()
	public id: number = 0;
	@json()
	@buffer()
	public name: string = '';
}

const serialisable = new Serialisable();
console.log(serialisable.toBuffer());