import * as Stmt from "./Stmt.ts";
import * as Expr from "./Expr.ts";
import { Interpreter } from "./Interpreter.ts";
import { Lox } from "./Lox.ts";
import { Token } from "./Token.ts";

enum FunctionType {
    NONE,
    FUNCTION,
    METHOD,
}

export class Resolver implements Expr.Visitor<void>, Stmt.Visitor<void> {
    currentFunction: FunctionType = FunctionType.NONE;
    interpreter: Interpreter;
    scopes: Map<string,boolean>[] = [];
    constructor(interpreter: Interpreter){
        this.interpreter = interpreter;
    };
    beginScope(): void {
        this.scopes.push(new Map<string, boolean>());
    };
    declare(name: Token): void {
        if (this.scopes.length === 0) return;

        const scope: Map<string, boolean> = this.scopes[this.scopes.length - 1]!;

        if(scope.has(name.lexeme)){
            Lox.error(name,"Already a variable with this name in this scope.");
        }
        scope.set(name.lexeme, false);
    };
    define(name: Token): void {
        if (this.scopes.length === 0) return;

        this.scopes[this.scopes.length -1]!.set(name.lexeme, true);
    };
    endScope(): void {
        this.scopes.pop();
    };
    resolve(statements: Stmt.Stmt[]): void;
    resolve(statement: Stmt.Stmt): void;
    resolve(expr: Expr.Expr): void;
    resolve(statementOrStatementsOrExpr: Stmt.Stmt[] | Stmt.Stmt | Expr.Expr ): void {

        if (Array.isArray(statementOrStatementsOrExpr)){
            const statements = statementOrStatementsOrExpr as Stmt.Stmt[];
            for (let statement of statements){
                this.resolve(statement);
            }
        } else if (statementOrStatementsOrExpr.base! === "Stmt"){
            const statement = statementOrStatementsOrExpr as Stmt.Stmt;
            statement.accept(this);
        } else if (statementOrStatementsOrExpr.base! === "Expr"){
            const expr = statementOrStatementsOrExpr as Expr.Expr;
            expr.accept(this);
        }
        return;
    };
    resolveFunction(f: Stmt.Function, type: FunctionType): void {
        const enclosingFunction: FunctionType = this.currentFunction;
        this.currentFunction = type;
        this.beginScope();

        for (const param of f.params) {
            this.declare(param);
            this.define(param);
        }

        this.resolve(f.body);
        this.endScope();
        this.currentFunction = enclosingFunction;

        return;
    };
    resolveLocal(expr: Expr.Expr, name: Token): void {
        for (let i = this.scopes.length - 1; i >= 0; i --) {
            if (this.scopes[i]!.has(name.lexeme)){
                this.interpreter.resolve(expr, this.scopes.length - 1 - i);
                return;
            }
        }
    };
    visitAssignExpr(expr: Expr.Assign): void {
        this.resolve(expr.value);
        this.resolveLocal(expr, expr.name);
        return;
    };
    visitBinaryExpr(expr: Expr.Binary): void {
        this.resolve(expr.left);
        this.resolve(expr.right);
        return;
    };
    visitBlockStmt(stmt: Stmt.Block): void {
        this.beginScope();
        this.resolve(stmt.statements);
        this.endScope()
        return;
    };
    visitCallExpr(expr: Expr.Call): void {
        this.resolve(expr.callee);

        for (const argument of expr.args){
            this.resolve(argument);
        }

        return;
    };
    visitClassStmt(stmt: Stmt.Class): void {
        this.declare(stmt.name);
        this.define(stmt.name);

        for (let method of stmt.methods){
            const declaration: FunctionType = FunctionType.METHOD;
            this.resolveFunction(method,declaration);
        }
        return;
    };
    visitExpressionStmt(stmt: Stmt.Expression): void {
        this.resolve(stmt.expression);
        return;
    };
    visitFunctionStmt(stmt: Stmt.Function): void {
        this.declare(stmt.name);
        this.define(stmt.name);

        this.resolveFunction(stmt, FunctionType.FUNCTION);

        return;
    };
    visitGetExpr(expr: Expr.Get): void {
        this.resolve(expr.object);
        return;
    };
    visitGroupingExpr(expr: Expr.Grouping): void {
        this.resolve(expr.expression);
        return;
    };
    visitIfStmt(stmt: Stmt.If): void {
        this.resolve(stmt.condition);
        this.resolve(stmt.thenBranch);

        if (stmt.elseBranch != null) this.resolve(stmt.elseBranch);
        return;
    };
    visitLiteralExpr(expr: Expr.Literal): void {
        return;
    };
    visitLogicalExpr(expr: Expr.Logical): void {
        this.resolve(expr.left);
        this.resolve(expr.right);
        return;
    };
    visitPrintStmt(stmt: Stmt.Print): void {
        this.resolve(stmt.expression);
        return;
    };
    visitReturnStmt(stmt: Stmt.Return): void {
        if (this.currentFunction === FunctionType.NONE){
            Lox.error(stmt.keyword,"Can't return from top-level code.");
        }
        if (stmt.value != null){
            this.resolve(stmt.value);
        }
        return;
    };
    visitSetExpr(expr: Expr.Set): void {
        this.resolve(expr.value);
        this.resolve(expr.object);
        return;
    };
    visitVarStmt(stmt: Stmt.Var): void {
        this.declare(stmt.name);

        if (stmt.initializer !== null){
            this.resolve(stmt.initializer);
        }

        this.define(stmt.name);

        return;
    };
    visitVariableExpr(expr: Expr.Variable): void {
        if (!(this.scopes.length === 0) && this.scopes[this.scopes.length - 1]!.get(expr.name.lexeme) === false) {
            Lox.error(expr.name,"Can't read local variable in it's own initializer.");
        }

        this.resolveLocal(expr, expr.name);
        return;
    };
    visitUnaryExpr(expr: Expr.Unary): void {
        this.resolve(expr.right);
        return;
    };
    visitWhileStmt(stmt: Stmt.While): void {
        this.resolve(stmt.condition);
        this.resolve(stmt.body);
        return;
    };
}
