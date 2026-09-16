import { Binary, Grouping, Literal, Unary } from "./Expr.ts";
import { Expr, type Visitor } from "./Expr.ts";

export class AstPrinter implements Visitor<string> {
    print(expr: Expr): string{
        return expr.accept(this);
    };

    visitBinaryExpr(expr: Binary): string {
        return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
    };
    visitGroupingExpr(expr: Grouping): string {
        return this.parenthesize("group", expr.expression);
    };
    visitLiteralExpr(expr: Literal): string {
        if (expr.value === null) return "nil";
        return expr.value.toString();
    };
    visitUnaryExpr(expr: Unary): string {
        return this.parenthesize(expr.operator.lexeme, expr.right);
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
