import { LoxClass } from "./LoxClass.ts";

export class LoxInstance {
    c:LoxClass;
    constructor(c: LoxClass){
        this.c = c;
    };
    toString(): string {
        return this.c + " instance";
    }
}
