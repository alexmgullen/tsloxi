import { Token } from "./Token.ts";
import { TokenType } from "./TokenType.ts";
import { Lox } from "./Lox.ts";

const keywords: Map<string,TokenType> = new Map<string,TokenType>([
    ['and',TokenType.AND],
    ['class',TokenType.CLASS],
    ['else',TokenType.ELSE],
    ['false',TokenType.FALSE],
    ['for',TokenType.FOR],
    ['fun',TokenType.FUN],
    ['if',TokenType.IF],
    ['nil',TokenType.NIL],
    ['or',TokenType.OR],
    ['print',TokenType.PRINT],
    ['return',TokenType.RETURN],
    ['super',TokenType.SUPER],
    ['this',TokenType.THIS],
    ['true',TokenType.TRUE],
    ['var',TokenType.VAR],
    ['while',TokenType.WHILE],
]);

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
        if (literal !== undefined) {
            this.tokens.push(new Token(type, text, literal, this.line));
        }else{
            this.tokens.push(new Token(type, text, null, this.line));
        }
    };
    advance(): string {
        this.current += 1;
        return this.source[this.current - 1]!;
    };
    identifier(): void {
        while (isAlphaNumeric(this.peek())) {
            this.advance();
        }

        const text: string = this.source.substring(this.start,this.current);
        var type: TokenType | undefined = keywords.get(text);
        if (type === undefined){
            type = TokenType.IDENTIFIER;
        }

        this.addToken(type);
    }
    isAtEnd(){
        return this.current >= this.source.length;
    };
    match(expected: string): boolean {
        if (this.isAtEnd()) return false;

        if (this.source[this.current] != expected){
            return false;
        }

        this.current += 1;
        return true;
    };
    number(){
        while (isDigit(this.peek())){
            this.advance();
        }

        if(this.peek() == '.' && isDigit(this.peekNext())){
            //Consume the "."
            this.advance();

            while (isDigit(this.peek())){
                this.advance();
            }
        }

        this.addToken(TokenType.NUMBER,parseFloat(this.source.substring(this.start,this.current)))
    };
    peek(): string {
        if(this.isAtEnd()) return '\0';
        return this.source[this.current]!;
    };
    peekNext(): string {
        if(this.current + 1 >= this.source.length){
            return '\0';
        }
        return this.source[this.current + 1]!;
    }
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
            case '"':
                this.string();
                break;
            default:
                if (isDigit(c)){
                    this.number();
                }else if (isAlpha(c)){
                    this.identifier();

                }else{
                    Lox.error(this.line,`Unexpected Character: ${c}`);
                }
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
    string(){
        while(this.peek() !== '"' && ! this.isAtEnd()){
            if (this.peek() == '\n'){
                this.line += 1;
            }
            this.advance();
        }

        if(this.isAtEnd()){
                Lox.error(this.line,`Unterminated String`);
                return;
        }

        // consume the closing "
        this.advance();

        const value: string = this.source.substring(this.start + 1, this.current - 1);
        this.addToken(TokenType.STRING,value);
    }
}

function isDigit(c: string): boolean {
    if (c >= '0' && c <= '9'){
        return true;
    }
    return false;
}

function isAlpha(c: string): boolean {
    return (c >= 'a' && c <= 'z') ||
            (c >= 'A' && c <= 'Z') ||
            c == '_';
}

function isAlphaNumeric(c: string): boolean {
    return isAlpha(c) || isDigit(c);
}
