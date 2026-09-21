import { RuntimeError } from "./RuntimeError.ts";
import { Token } from "./Token.ts";
import { TokenType } from "./TokenType.ts";

export class Return extends RuntimeError {
    value: Object | null;
    constructor(value: Object | null){
        super(new Token(TokenType.EOF,'',null,0),'');
        this.value = value;
    }
}
