import { Interpreter } from "./Interpreter.ts";
import { LoxCallable } from "./LoxCallable.ts";
import { LoxInstance } from "./LoxInstance.ts";

export class LoxClass extends LoxCallable {
    name: string;
    constructor(name: string){
        super();
        this.name = name;
    };
    toString(){
        return this.name;
    };
    loxcall(interpreter: Interpreter, args: Array<Object | null>): Object | null {
        const instance: LoxInstance = new LoxInstance(this);
        return instance;
    };
    arity(): number {
        return 0;
    };
}
