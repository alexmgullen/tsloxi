import { Token } from "./Token.ts";
import { RuntimeError } from "./RuntimeError.ts";

export class Environment {
    values: Map<String, Object | null> = new Map();
    assign(name: Token, value: Object | null): void {
        const v = this.values.get(name.lexeme);
        if (v !== undefined) {
            this.values.set(name.lexeme,value);
            return;
        }

        throw new RuntimeError(name, "Undefined Variable '" + name.lexeme + ";.");
    };
    define(name: string, value: Object | null): void {
        this.values.set(name,value);
    };
    get(name: Token): Object | null {
        const v = this.values.get(name.lexeme);
        if (v !== undefined){
            return v;
        }

        throw new RuntimeError(name, "Undefined Variable '" + name.lexeme + ";.");
    }
}
