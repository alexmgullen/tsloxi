import { Binary, Call, Grouping, Literal, Logical, Unary, Variable, Assign } from "./Expr.ts";
import { Expr, Get, Set , type Visitor } from "./Expr.ts";

export class AstPrinter implements Visitor<string> {
    print(expr: Expr): string{
        return expr.accept(this);
    };    
    visitAssignExpr(expr: Assign): string {
        return this.parenthesize(expr.name.lexeme, expr);
    };
    visitBinaryExpr(expr: Binary): string {
        return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
    };
    visitCallExpr(expr: Call): string {
        return this.parenthesize(expr.paren.lexeme);
    };
    visitGetExpr(expr: Get): string {
        return this.parenthesize(expr.name.lexeme);
    };
    visitGroupingExpr(expr: Grouping): string {
        return this.parenthesize("group", expr.expression);
    };
    visitLiteralExpr(expr: Literal): string {
        if (expr.value === null) return "nil";
        return expr.value.toString();
    };
    visitLogicalExpr(expr: Logical): string {
        return this.parenthesize(expr.operator.lexeme, expr.left, expr.right); 
    };
    visitSetExpr(expr: Set): string {
        return this.parenthesize(expr.name.lexeme);
    }
    visitUnaryExpr(expr: Unary): string {
        return this.parenthesize(expr.operator.lexeme, expr.right);
    };
    visitVariableExpr(expr: Variable): string {
        return this.parenthesize(expr.name.lexeme, expr);
    };
    parenthesize(name: string,...exprs: Expr[]): string {
        let builder = "";

        builder += "(" + name;
        for (const expr of exprs){
            builder += " ";
            builder += expr.accept(this);
        }
        builder += ")";

        return builder;
    }
}
