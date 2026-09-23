import { Interpreter } from "./Interpreter.ts";
import { LoxCallable } from "./LoxCallable.ts";
import { LoxInstance } from "./LoxInstance.ts";
import { LoxFunction } from "./LoxFunction.ts";

export class LoxClass extends LoxCallable {
    methods: Map<string, LoxFunction>;
    name: string;
    constructor(name: string, methods: Map<string, LoxFunction>){
        super();
        this.methods = methods;
        this.name = name;
    };
    findMethod(name: string): LoxFunction | null {
        if(this.methods.has(name)){
            return this.methods.get(name) ?? null;
        }

        return null;
    }
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
