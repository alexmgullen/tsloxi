import { Interpreter } from "./Interpreter.ts"

export class Callable {

    loxcall(interpreter: Interpreter, args: Array<Object | null>): Object | null {
        return null;
    };
    arity(): number {
        return 0;
    };
}
