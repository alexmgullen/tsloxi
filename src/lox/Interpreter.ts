import { Binary, Expr, Grouping, Literal, Unary, type Visitor } from "./Expr.ts";
import { Lox } from "./Lox.ts";
import { RuntimeError } from "./RuntimeError.ts";
import { Token } from "./Token.ts";
import { TokenType } from "./TokenType.ts";


export class Interpreter implements Visitor<Object | null> {
    checkNumberOperand(operator: Token, operand: Object | null){
        if (typeof operand === "number") return;
        throw new RuntimeError(operator, "Operand must be a number");
    };
    checkNumberOperands(operator: Token, left: Object | null, right: Object | null){
        if (typeof left === "number" && typeof right === "number") return;
        throw new RuntimeError(operator, "Operand must be a number");
    };
    evaluate(expr: Expr): Object | null {
        return expr.accept(this);
    };
    interpret(expression: Expr){
        try {
            const value: Object | null = this.evaluate(expression);
            console.log(this.stringify(value));
        } catch (e: any) {
            if ("token" in e){
                Lox.runtimeError(e as RuntimeError);
            }else {
                Lox.report(0,"",e.message)
            }
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
    }
    visitBinaryExpr(expr: Binary): Object | null {
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
    visitGroupingExpr(expr: Grouping): Object | null {
        return this.evaluate(expr.expression);
    };
    visitLiteralExpr(expr: Literal): Object | null {
        return expr.value;
    };
    visitUnaryExpr(expr: Unary): Object | null {
        const right: Object | null = this.evaluate(expr.right);

        switch (expr.operator.type) {
            case TokenType.BANG:
                return !this.isTruthy(right);
            case TokenType.MINUS:
                return - (right as number);
        }

        //unreachable
        return null;
    }
}
