import { Binary, Expr, Unary, Grouping, Literal } from "./Expr.ts";
import { Lox } from "./Lox.ts";
import { Token } from "./Token.ts";
import { TokenType } from "./TokenType.ts";

class ParseError extends SyntaxError {};

export class Parser{
    tokens: Token[];
    current: number = 0;
    constructor(tokens: Token[]){
        this.tokens = tokens;
    };
    advance(): Token {
        if(!this.isAtEnd()){
            this.current += 1;
        }
        return this.previous();
    };
    check(t: TokenType): boolean {
        if(this.isAtEnd()){
            return false;
        }
        return this.peek().type === t;
    };
    // comparison     → term ( ( ">" | ">=" | "<" | "<=" ) term )* ;
    comparison(): Expr {
        let expr: Expr = this.term();

        while (this.match(TokenType.GREATER,TokenType.GREATER_EQUAL,TokenType.LESS,TokenType.LESS_EQUAL)) {
            const operator: Token = this.previous();
            const right: Expr     = this.term();

            expr = new Binary(expr, operator, right);
        }

        return expr;
    };
    consume(t: TokenType, message: string): Token {
        if(this.check(t)) return this.advance();

        throw this.error(this.peek(), message);
    }
    error(token: Token, message: string): ParseError {
        Lox.error(token,message);
        return new ParseError();
    };
    // expression     -> equality
    expression(): Expr {
        return this.equality();
    };
    // equality       -> comparison ( ( "!=" | "==" ) comparison )* ;
    equality(): Expr {
        let expr: Expr = this.comparison();

        while(this.match(TokenType.BANG_EQUAL,TokenType.EQUAL_EQUAL)){
            const operator: Token = this.previous();
            const right: Expr = this.comparison();
            expr = new Binary(expr, operator, right);
        }

        return expr;

    };
    factor(): Expr {
        let expr: Expr = this.unary();

        while (this.match(TokenType.SLASH,TokenType.STAR)) {
            const operator: Token = this.previous();
            const right: Expr = this.unary();
            expr = new Binary(expr, operator, right);
        }

        return expr;
    };
    isAtEnd(): boolean {
        if(this.peek().type == TokenType.EOF){
            return true;
        }
        return false;
    };
    match(...tokens: TokenType[]): boolean {
        for(const token of tokens){
            if(this.check(token)){
                this.advance();
                return true;
            }
        }

        return false;
    };
    parse(): Expr | null {
        try {
            return this.expression();
        } catch {
            return null;
        }
    };
    peek(): Token {
        return this.tokens[this.current]!;
    };
    previous(): Token {
        return this.tokens[this.current -1]!;
    };
    primary(): Expr {
        if (this.match(TokenType.FALSE)) return new Literal(false);
        if (this.match(TokenType.TRUE)) return new Literal(true);
        if (this.match(TokenType.NIL)) return new Literal(null);

        if (this.match(TokenType.NUMBER,TokenType.STRING)) {
            return new Literal(this.previous().literal);
        }

        if (this.match(TokenType.LEFT_PAREN)){
            const expr: Expr = this.expression();
            this.consume(TokenType.RIGHT_PAREN,"Expect ')' after expression.");
            return new Grouping(expr);
        }

        throw this.error(this.peek(),"Expected Expression.");
    };
    synchronize(): void {
        this.advance();

        while (!this.isAtEnd()){
            if(this.previous().type == TokenType.SEMICOLON) return;

            switch (this.peek().type){
                case TokenType.CLASS:
                case TokenType.FUN:
                case TokenType.VAR:
                case TokenType.FOR:
                case TokenType.IF:
                case TokenType.WHILE:
                case TokenType.PRINT:
                case TokenType.RETURN:
                    return;
            }

            this.advance();
        }
    };
    term(): Expr {
        let expr = this.factor();

        while (this.match(TokenType.MINUS,TokenType.PLUS)) {
            const operator: Token = this.previous();
            const right: Expr = this.factor();
            expr = new Binary(expr, operator, right);
        }

        return expr;
    };
    unary(): Expr {
        if(this.match(TokenType.BANG,TokenType.MINUS)) {
            const operator: Token = this.previous();
            const right: Expr = this.unary();
            return new Unary(operator,right);
        }

        return this.primary();
    }
}
