import { Token } from "./Token.ts";

//TODO: rename this to be RuntimeException
export class RuntimeError extends Error {
    token: Token;
    constructor(token: Token, message: string ){
        super(message);
        this.token = token;
    }
}
