import { Token } from "./Token.ts";
import { RuntimeError } from "./RuntimeError.ts";

export class Environment {
    enclosing: Environment | null = null;
    values: Map<String, Object | null> = new Map();
    constructor(enclosing?: Environment){
        if (enclosing){
            this.enclosing = enclosing;
        }
    };
    ancestors(distance: number): Environment {
        let environment: Environment = this;
        for (let i = 0; i < distance; i++ ){
            environment = environment.enclosing!;
        }

        return environment;
    };
    assign(name: Token, value: Object | null): void {
        const v = this.values.get(name.lexeme);
        if (v !== undefined) {
            this.values.set(name.lexeme,value);
            return;
        }

        if (this.enclosing != null){
            this.enclosing.assign(name,value);
            return;
        }

        throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
    };
    assignAt(distance: number, name: Token, value: Object | null){
        this.ancestors(distance).values.set(name.lexeme, value);
    };
    define(name: string, value: Object | null): void {
        this.values.set(name,value);
    };
    get(name: Token): Object | null {
        const v = this.values.get(name.lexeme);
        if (v !== undefined){
            return v;
        }
        if (this.enclosing != null) return this.enclosing.get(name)

        throw new RuntimeError(name, "Undefined Variable '" + name.lexeme + ";.");
    };
    getAt(distance: number, name: string): Object | null {
        return this.ancestors(distance).values.get(name) ?? null;
    };
}
