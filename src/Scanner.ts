import { Token } from "./Token.ts";
import { TokenType } from "./TokenType.ts";
import { Lox } from "./Lox.ts";

export class Scanner{
    source: string;
    tokens: Token[] = [];

    start: number = 0;
    current: number = 0;
    line: number = 1;

    constructor(source: string){
        this.source = source;
    };
    addToken(type: TokenType, literal?: any): void {
        const text: string = this.source.substring(this.start,this.current);
        if (literal != undefined) {
            this.tokens.push(new Token(type, text, literal, this.line));
        }else{
            this.tokens.push(new Token(type, text, null, this.line));
        }
    };
    advance(): string{
        this.current += 1;
        return this.source.substring(this.current - 1, this.current);
    };
    isAtEnd(){
        return this.current >= this.source.length;
    };
    match(expected: string): boolean {
        if (this.isAtEnd()) return false;

        if (this.source.substring(this.current - 1, this.current) != expected){
            return false;
        }

        this.current += 1;
        return true;
    };
    peek(){
        if(this.isAtEnd()) return '\0';
        return this.source.substring(this.current -1, this.current);
    };
    scanToken() {
        const c: string = this.advance();
        switch (c){
            case '(': this.addToken(TokenType.LEFT_PAREN);  break;
            case ')': this.addToken(TokenType.RIGHT_PAREN); break;
            case '{': this.addToken(TokenType.LEFT_BRACE);  break;
            case '}': this.addToken(TokenType.RIGHT_BRACE); break;
            case ',': this.addToken(TokenType.COMMA);       break;
            case '.': this.addToken(TokenType.DOT);         break;
            case '-': this.addToken(TokenType.MINUS);       break;
            case '+': this.addToken(TokenType.PLUS);        break;
            case ';': this.addToken(TokenType.SEMICOLON);   break;
            case '*': this.addToken(TokenType.STAR);        break;
            case '!':
                this.addToken(this.match('=') ? TokenType.BANG_EQUAL : TokenType.BANG);
                break;
            case '=':
                this.addToken(this.match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL);
                break;
            case '<':
                this.addToken(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS);
                break;
            case '>':
                this.addToken(this.match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER);
                break;
            case '/':
                if(this.match('/')) {
                    while (this.peek() != '\n' && !this.isAtEnd()) this.advance();
                } else {
                    this.addToken(TokenType.SLASH);
                }
                break;
            case ' ':
            case '\r':
            case '\t':
                //Ignore whitespace
                break;
            case '\n':
                this.line += 1;
                break;
            default: 
                Lox.error(this.line,`Unexpected Character: ${c}`);
                break;
        }
    };
    scanTokens(): Token[]{
        while(!this.isAtEnd()){
            this.start = this.current;
            this.scanToken();
        }

        this.tokens.push(new Token(TokenType.EOF,"",null,this.line));
        return this.tokens;
    };
}
