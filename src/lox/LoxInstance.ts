import { LoxClass } from "./LoxClass.ts";
import { RuntimeError } from "./RuntimeError.ts";
import { Token } from "./Token.ts";
import { LoxFunction } from "./LoxFunction.ts";

export class LoxInstance {
    c:LoxClass;
    fields: Map<string, Object | null> = new Map();
    constructor(c: LoxClass){
        this.c = c;
    };
    get(name: Token): Object | null {
        if(this.fields.has(name.lexeme)){
            return this.fields.get(name.lexeme) ?? null;
        }

        const method: LoxFunction | null = this.c.findMethod(name.lexeme);
        if (method != null) return method;

        throw new RuntimeError(name, "Undefined property '" + name.lexeme + "'.");
    };
    set(name: Token, value: Object | null): void{
        this.fields.set(name.lexeme, value);
    };
    toString(): string {
        return this.c + " instance";
    };
}
