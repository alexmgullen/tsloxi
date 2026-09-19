import { Environment } from "./Environment.ts";
import * as Expr from "./Expr.ts";
import { Lox } from "./Lox.ts";
import { RuntimeError } from "./RuntimeError.ts";
import * as Stmt from "./Stmt.ts";
import { Token } from "./Token.ts";
import { TokenType } from "./TokenType.ts";


export class Interpreter implements Expr.Visitor<Object | null>, Stmt.Visitor<void> {
    environment: Environment = new Environment();
    checkNumberOperand(operator: Token, operand: Object | null){
        if (typeof operand === "number") return;
        throw new RuntimeError(operator, "Operand must be a number");
    };
    checkNumberOperands(operator: Token, left: Object | null, right: Object | null){
        if (typeof left === "number" && typeof right === "number") return;
        throw new RuntimeError(operator, "Operand must be a number");
    };
    evaluate(expr: Expr.Expr): Object | null {
        return expr.accept(this);
    };
    interpret(statements: Stmt.Stmt[]){
        try {
            for (const statement of statements){
                this.execute(statement);
            }
        } catch (e: any) {
            if ("token" in e){
                Lox.runtimeError(e as RuntimeError);
            }else {
                Lox.report(0,"",e.message)
            }
        }
    };
    execute(stmt: Stmt.Stmt){
        stmt.accept(this);
    };
    executeBlock(statements: Stmt.Stmt[],environment: Environment){
        const previous: Environment = this.environment;

        try{

            this.environment = environment;

            for(const statement of statements){
                this.execute(statement);
            }
        } finally {
            this.environment = previous;
        }
    };
    isEqual(a: Object | null , b: Object | null ): boolean {
        if (a === null && b === null) return true;
        if (a === null) return false;
        
        const aEntries = Object.entries(a);
        const bEntries = Object.entries(b!);
        if (aEntries.length !== bEntries.length) return false;

        for(let i = 0; i < aEntries.length; i ++){
            if(aEntries[i] !== bEntries[i]){
                return false;
            }
        }

        return true;
    };
    isTruthy(object: any): boolean {
        if(object === null) return false;
        if(typeof object === "boolean" && object === false) return false;
        return true;
    };
    stringify(object: Object | null): string {
        if (object == null) return "nil";

        if (typeof object === "number"){
            let text = object.toString();
            if (text.endsWith(".0")) {
                text = text.substring(0, text.length - 2);
            }
            return text!;
        }

        return object.toString();
    };
    visitAssignExpr(expr: Expr.Assign): Object | null {
        const value: Object | null = this.evaluate(expr.value);

        this.environment.assign(expr.name, value);

        return value;
    };
    visitBinaryExpr(expr: Expr.Binary): Object | null {
        const left: Object | null = this.evaluate(expr.left);
        const right: Object | null = this.evaluate(expr.right);

        switch (expr.operator.type) {
            case TokenType.MINUS:
                this.checkNumberOperands(expr.operator, left, right);
                return (left as number) - (right as number);
            case TokenType.SLASH:
                this.checkNumberOperands(expr.operator, left, right);
                return (left as number) / (right as number);
            case TokenType.STAR:
                this.checkNumberOperands(expr.operator, left, right);
                return (left as number) * (right as number);

            case TokenType.PLUS:
                if (typeof left === "number" && typeof right === "number"){
                    return (left as number) + (right as number);
                }

                if (typeof left === "string" && typeof right === "string"){
                    return (left as string) + (right as string);
                }

                throw new RuntimeError(expr.operator, "Operand must be two numbers or two strings");
            case TokenType.GREATER:
                this.checkNumberOperands(expr.operator, left, right);
                return (left as number) > (right as number);
            case TokenType.GREATER_EQUAL:
                this.checkNumberOperands(expr.operator, left, right);
                return (left as number) >= (right as number);
            case TokenType.LESS:
                this.checkNumberOperands(expr.operator, left, right);
                return (left as number) < (right as number);
            case TokenType.LESS_EQUAL:
                this.checkNumberOperands(expr.operator, left, right);
                return (left as number) <= (right as number);
            case TokenType.BANG_EQUAL:
                return !this.isEqual(left,right);
            case TokenType.EQUAL_EQUAL:
                return this.isEqual(left,right);
        }

        // Unreachable
        return null;
    };
    visitBlockStmt(stmt: Stmt.Block): void {
        this.executeBlock(stmt.statements, new Environment(this.environment));
        return;
    };
    visitExpressionStmt(stmt: Stmt.Expression){
        this.evaluate(stmt.expression);
        return;
    };
    visitGroupingExpr(expr: Expr.Grouping): Object | null {
        return this.evaluate(expr.expression);
    };
    visitIfStmt(stmt: Stmt.If): void {
        if (this.isTruthy(this.evaluate(stmt.condition))) {
            this.execute(stmt.thenBranch);
        } else if (stmt.elseBranch != null){
            this.execute(stmt.elseBranch);
        }
        return;
    };
    visitLiteralExpr(expr: Expr.Literal): Object | null {
        return expr.value;
    };
    visitLogicalExpr(expr: Expr.Logical): Object | null {
        const left = this.evaluate(expr.left);

        if (expr.operator.type === TokenType.OR){
            if(this.isTruthy(left)) return left;
        } else {
            if(!this.isTruthy(left)) return left;
        }

        return this.evaluate(expr.right);
    };
    visitPrintStmt(stmt: Stmt.Print){
        const value: Object | null = this.evaluate(stmt.expression)
        console.log(this.stringify(value));
        return;
    };
    visitUnaryExpr(expr: Expr.Unary): Object | null {
        const right: Object | null = this.evaluate(expr.right);

        switch (expr.operator.type) {
            case TokenType.BANG:
                return !this.isTruthy(right);
            case TokenType.MINUS:
                return - (right as number);
        }

        //unreachable
        return null;
    };
    visitVarStmt(stmt: Stmt.Var){
        let value: Object | null = null;
        if (stmt.initializer != null){
            value = this.evaluate(stmt.initializer);
        }

        this.environment.define(stmt.name.lexeme, value);
        return null;
    };
    visitVariableExpr(expr: Expr.Variable): Object | null {
        return this.environment.get(expr.name)
    };
}
