import { Interpreter } from "./Interpreter.ts";
import { LoxCallable } from "./LoxCallable.ts";
import { LoxInstance } from "./LoxInstance.ts";
import { LoxFunction } from "./LoxFunction.ts";

export class LoxClass extends LoxCallable {
    methods: Map<string, LoxFunction>;
    name: string;
    superclass: LoxClass | null;
    constructor(name: string, methods: Map<string, LoxFunction>, superclass: LoxClass | null){
        super();
        this.methods = methods;
        this.name = name;
        this.superclass = superclass;
    };
    findMethod(name: string): LoxFunction | null {
        if(this.methods.has(name)){
            return this.methods.get(name) ?? null;
        }

        if (this.superclass != null){
            return this.superclass.findMethod(name);
        }

        return null;
    }
    toString(): string {
        return this.name;
    };
    loxcall(interpreter: Interpreter, args: Array<Object | null>): Object | null {
        const instance: LoxInstance = new LoxInstance(this);
        const initializer: LoxFunction | null = this.findMethod("init");
        if (initializer !== null){
            initializer.bind(instance).loxcall(interpreter,args);
        }

        return instance;
    };
    arity(): number {
        const initializer: LoxFunction | null = this.findMethod("init");
        if(initializer === null) return 0;
        return initializer.arity();
    };
}
