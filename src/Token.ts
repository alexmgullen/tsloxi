import type { TokenType } from './TokenType.ts';

class Token{
    token: TokenType;
    lexeme: string;
    literal: any;
    line: number;
    constructor(token: TokenType, lexeme: string, literal: any, line: number){
        this.token   = token;
        this.lexeme  = lexeme;
        this.literal = literal;
        this.line    = line;
    };
}
