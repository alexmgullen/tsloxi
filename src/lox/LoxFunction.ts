import { Environment } from "./Environment.ts";
import { Function } from "./Stmt.ts";
import { Interpreter } from "./Interpreter.ts";
import { LoxCallable } from "./LoxCallable.ts";
import { LoxInstance } from "./LoxInstance.ts";
import { Return } from "./Return.ts";

export class LoxFunction extends LoxCallable {
    declaration: Function;
    closure: Environment;
    isInitializer: boolean;
    constructor(declaration: Function, closure: Environment, isInitializer: boolean){
        super();
        this.closure = closure;
        this.declaration = declaration;
        this.isInitializer = isInitializer;
    };
    arity(): number {
        return this.declaration.params.length;
    };
    bind(instance: LoxInstance): LoxFunction {
        const environment: Environment = new Environment(this.closure);
        environment.define("this",instance);
        return new LoxFunction(this.declaration,environment,this.isInitializer);
    };
    loxcall(interpreter: Interpreter, args: Array<Object | null>) : Object | null {
        const environment: Environment = new Environment(this.closure);

        for(let i = 0; i < this.declaration.params.length; i ++){
            environment.define(this.declaration.params[i]!.lexeme, args[i]!);
        }

        try {
            interpreter.executeBlock(this.declaration.body, environment);
        } catch (v: any){
            if(v instanceof Return){
                if (this.isInitializer) return this.closure.getAt(0,"this");
                return v.value;
            }else{
                throw v;
            }
        }

        if (this.isInitializer) return this.closure.getAt(0,"this");
        return null;
    };
    toString(): string {
        return `<fn ${this.declaration.name.lexeme}>`;
    };
}
