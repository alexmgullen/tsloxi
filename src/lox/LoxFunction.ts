import { Environment } from "./Environment.ts";
import { Function } from "./Stmt.ts";
import { Interpreter } from "./Interpreter.ts";
import { LoxCallable } from "./LoxCallable.ts";
import { Return } from "./Return.ts";

export class LoxFunction extends LoxCallable {
    declaration: Function;
    closure: Environment;
    constructor(declaration: Function, closure: Environment){
        super();
        this.closure = closure;
        this.declaration = declaration;
    };
    arity(): number {
        return this.declaration.params.length;
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
                return v.value;
            }
        }
        return null;
    };
    toString(): string {
        return `<fn ${this.declaration.name.lexeme} >`;
    };
}
