import { AstPrinter } from "./lox/AstPrinter.ts";
import { Binary, Grouping, Literal, Unary } from "./lox/Expr.ts";
import { Expr, type Visitor } from "./lox/Expr.ts";
import { Token } from "./lox/Token.ts";
import { TokenType } from "./lox/TokenType.ts";


function assertEqual(a: any,b: any){
    if (a === b){
        console.log("assertEqual: ",a, " === ", b, "passed ✅;");
    }else{
        console.log("assertEqual:", a, " === ", b, "failed ❌;");
        process.exit(1);
    }
}

const expression: Expr = new Binary(
    new Unary(
        new Token(TokenType.MINUS, "-", null, 1),
        new Literal(123),
    ),
    new Token(TokenType.STAR, "*", null, 1),
    new Grouping(
        new Literal(45.67),
    )
)

assertEqual(new AstPrinter().print(expression),"(* (- 123) (group 45.67))");
