import { Assign, Binary, Expr, Unary, Grouping, Literal, Logical, Variable } from "./Expr.ts";
import { Lox } from "./Lox.ts";
import { Expression, Print, Stmt, Var, Block, If } from "./Stmt.ts";
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
    and(): Expr {
        let expr = this.equality();

        while (this.match(TokenType.AND)){

            const operator: Token = this.previous();
            const right: Expr = this.equality();
            expr = new Logical(expr, operator, right);
        }

        return expr;
    };
    assignment(): Expr {
        const expr: Expr = this.or();

        if(this.match(TokenType.EQUAL)){
            const equals = this.previous();
            const value = this.assignment();

            if (expr instanceof Variable){
                const name: Token = (expr as Variable).name;
                return new Assign(name, value);
            }

            this.error(equals,"Invalid assignment target.");
        }

        return expr;
    };
    block(): Stmt[] {
        const statements: Stmt[] = [];

        while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
            const d = this.declaration();

            if (d) statements.push(d);
        }

        this.consume(TokenType.RIGHT_BRACE,"Expect '}' after block.");
        return statements;
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
    };
    declaration(): Stmt | null {
        try {
            if(this.match(TokenType.VAR)) return this.varDeclaration();

            return this.statement();
        }  catch {
            this.synchronize();
            return null;
        }
    };
    error(token: Token, message: string): ParseError {
        Lox.error(token,message);
        return new ParseError();
    };
    // expression     -> equality
    expression(): Expr {
        return this.assignment();
    };
    expressionStatement(): Stmt {
        const expr: Expr = this.expression();
        this.consume(TokenType.SEMICOLON,"Expect ';' after expression.");
        return new Expression(expr);
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
    ifStatement(): Stmt {
        this.consume(TokenType.LEFT_PAREN,"Expect '(' after 'if'.");
        const condition: Expr = this.expression();
        
        this.consume(TokenType.RIGHT_PAREN,"Expect ')' after if condition.")

        const thenBranch: Stmt = this.statement();
        let elseBranch: Stmt | null = null;
        if (this.match(TokenType.ELSE)){
            elseBranch = this.statement();
        }

        return new If(condition,thenBranch,elseBranch);
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
    or(): Expr {
        let expr: Expr = this.and();

        while (this.match(TokenType.OR)){
            const operator: Token = this.previous();
            const right: Expr = this.and();
            expr = new Logical(expr,operator,right);
        }

        return expr;
    };
    parse(): Stmt[] {
        const statements: Stmt[] = [];

        while (!this.isAtEnd()) {
            const d = this.declaration();
            if (d) statements.push(d);
        }

        return statements;
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

        if (this.match(TokenType.IDENTIFIER)) {
            return new Variable(this.previous());
        }

        if (this.match(TokenType.LEFT_PAREN)){
            const expr: Expr = this.expression();
            this.consume(TokenType.RIGHT_PAREN,"Expect ')' after expression.");
            return new Grouping(expr);
        }

        throw this.error(this.peek(),"Expected Expression.");
    };
    printStatement(): Stmt{
        const value: Expr = this.expression();

        this.consume(TokenType.SEMICOLON,"Expect ';' after value.")
        return new Print(value);
    };
    statement(): Stmt {
        if (this.match(TokenType.IF)) return this.ifStatement();
        if (this.match(TokenType.PRINT)) return this.printStatement();
        if (this.match(TokenType.LEFT_BRACE)) return new Block(this.block());

        return this.expressionStatement();
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
    };
    varDeclaration(): Stmt {
        const name: Token = this.consume(TokenType.IDENTIFIER,"Expect variable name.");

        let initializer: Expr;

        if(this.match(TokenType.EQUAL)){
            initializer = this.expression();
        }

        this.consume(TokenType.SEMICOLON,"Expect ';' after variable declaration");
        return new Var(name,initializer!);
    };
}
