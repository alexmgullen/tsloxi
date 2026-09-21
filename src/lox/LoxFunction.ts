import { Environment } from "./Environment.ts";
import { Function } from "./Stmt.ts";
import { Interpreter } from "./Interpreter.ts";
import { LoxCallable } from "./LoxCallable.ts";

export class LoxFunction extends LoxCallable {
    declaration: Function;
    constructor(declaration: Function){
        super();
        this.declaration = declaration;
    };
    arity(): number {
        return this.declaration.params.length;
    };
    loxcall(interpreter: Interpreter, args: Array<Object | null>) : Object | null {
        const environment: Environment = new Environment(interpreter.globals);

        for(let i = 0; i < this.declaration.params.length; i ++){
            environment.define(this.declaration.params[i]!.lexeme, args[i]!);
        }

        interpreter.executeBlock(this.declaration.body, environment);
        return null;
    };
    toString(): string {
        return `<fn ${this.declaration.name.lexeme} >`;
    };
}
