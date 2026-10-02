import * as Stmt from "./Stmt.ts";
import * as Expr from "./Expr.ts";
import { Interpreter } from "./Interpreter.ts";
import { Lox } from "./Lox.ts";
import { Token } from "./Token.ts";

enum FunctionType {
    NONE,
    FUNCTION,
    INITIALIZER,
    METHOD,
}

enum ClassType {
    NONE,
    CLASS,
    SUBCLASS,
}

let currentClass: ClassType = ClassType.NONE;

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
                this.resolve(statement as Stmt.Stmt);
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
    visitArrExpr(expr: Expr.Arr): void {
        for(const e of expr.exprs){
            this.resolve(e);
        }
        return;
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
        const enclosingClass = currentClass;
        currentClass = ClassType.CLASS;
        this.declare(stmt.name);
        this.define(stmt.name);

        if (stmt.superclass != null && stmt.name.lexeme === stmt.superclass.name.lexeme){
            Lox.error(stmt.superclass.name,"A class can't inherit from itself.");
        }

        if (stmt.superclass !== null) {
            currentClass = ClassType.SUBCLASS;
            this.resolve(stmt.superclass);
            this.beginScope();
            this.scopes[this.scopes.length - 1]!.set("super",true);
        }

        this.beginScope();
        this.scopes[this.scopes.length - 1]!.set("this",true);

        for (let method of stmt.methods){
            let declaration: FunctionType = FunctionType.METHOD;
            if(method.name.lexeme === "init") {
                declaration = FunctionType.INITIALIZER;
            }
            this.resolveFunction(method,declaration);
        }

        this.endScope();
        
        if (stmt.superclass != null) this.endScope();
        currentClass = enclosingClass;

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
        if (stmt.value !== null){
            if (this.currentFunction === FunctionType.INITIALIZER) {
                Lox.error(stmt.keyword, "Can't return a value from an initializer.");
            }
            this.resolve(stmt.value);
        }
        return;
    };
    visitSetExpr(expr: Expr.Set): void {
        this.resolve(expr.value);
        this.resolve(expr.object);
        return;
    };
    visitSuperExpr(expr: Expr.Super): void {
        if (currentClass === ClassType.NONE){
            Lox.error(expr.keyword,
                     "Can't use 'super' outside of a class.");
        } else if (currentClass != ClassType.SUBCLASS){
            Lox.error(expr.keyword,"Can't use 'super' in a class with no superclass.");
        }
        this.resolveLocal(expr, expr.keyword);
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
        if ((this.scopes.length > 0) && this.scopes[this.scopes.length - 1]!.get(expr.name.lexeme) === false) {
            Lox.error(expr.name,"Can't read local variable in its own initializer.");
        }

        this.resolveLocal(expr, expr.name);
        return;
    };
    visitThisExpr(expr: Expr.This): void {
        if (currentClass === ClassType.NONE){
            Lox.error(expr.keyword,
                     "Can't use 'this' outside of a class.");
                     return;
        }
        this.resolveLocal(expr, expr.keyword);
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
