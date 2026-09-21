import { Interpreter } from "./Interpreter.ts"

// LoxCallable doesn't technically need to be LoxCallable in javascript because Callable isn't reserved, but function and it's case variants are so this nameing scheme ensures the children and the parents are similarily named
export class LoxCallable {

    //call is reserved in javascript as well
    loxcall(interpreter: Interpreter, args: Array<Object | null>): Object | null {
        return null;
    };
    arity(): number {
        return 0;
    };
}
