import { Environment } from "./Environment.ts";
import * as Expr from "./Expr.ts";
import { Lox } from "./Lox.ts";
import { LoxCallable } from "./LoxCallable.ts";
import { LoxClass } from "./LoxClass.ts";
import { LoxFunction } from "./LoxFunction.ts";
import { LoxInstance } from "./LoxInstance.ts";
import { Return } from "./Return.ts";
import { RuntimeError } from "./RuntimeError.ts";
import * as Stmt from "./Stmt.ts";
import { Token } from "./Token.ts";
import { TokenType } from "./TokenType.ts";


export class Interpreter implements Expr.Visitor<Object | null>, Stmt.Visitor<void> {
    locals: Map<Expr.Expr, number> = new Map<Expr.Expr, number>();
    globals = new Environment();
    environment: Environment = this.globals;
    constructor(){

        const clock = new LoxCallable();
        clock.loxcall = () => {
            return (performance.now() / 1000.0) as number;
        };
        clock.arity = () => 0;
        clock.toString = () => "<native fn>";

        this.globals.define("clock", clock);
    };
    checkNumberOperand(operator: Token, operand: Object | null){
        if (typeof operand === "number") return;
        throw new RuntimeError(operator, "Operand must be a number.");
    };
    checkNumberOperands(operator: Token, left: Object | null, right: Object | null){
        if (typeof left === "number" && typeof right === "number") return;
        throw new RuntimeError(operator, "Operands must be numbers.");
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
        if (a === null || b === null) return false;
        if (typeof a !== typeof b) return false;
        //TODO: this equality check is good enough to past the testcases, but It could be more watertight
        switch(typeof a){
            case "boolean":
                return (a as boolean) === (b as boolean);
            case "number":
                return (a as number) === (b as number);
            case "bigint":
                return (a as bigint) === (b as bigint);
            case "string":
                return (a as string) === (b as string);
            case "symbol":
                return (a as symbol).toString() === (b as symbol).toString();
            case "function":
                return (a as Function).toString() === (b as Function).toString();
            case "object":
                if(Array.isArray(a) && Array.isArray(b)){
                    if(a.length != b.length) return false;
                    for (let i = 0; i < a.length; i ++){
                        if (a[i] !== b[i]) return false;
                    }

                    return true;
                }
                if(Array.isArray(a) || Array.isArray(b)) return false;
                const aEntries = Object.entries(a);
                const bEntries = Object.entries(b);

                if (aEntries.length !== bEntries.length) return false;
                for(let i = 0; i < aEntries.length; i ++){
                    if(! this.isEqual(aEntries[i] ?? null,bEntries[i] ?? null)){
                        return false;
                    }
                }
                return true;
        }

        return false;
    };
    isTruthy(object: any): boolean {
        if(object === null) return false;
        if(typeof object === "boolean" && object === false) return false;
        return true;
    };
    lookupVariable(name: Token, expr: Expr.Expr): Object | null {
        const distance: number | null = this.locals.get(expr) ?? null;
        if (distance != null) {
            return this.environment.getAt(distance, name.lexeme);
        } else {
            return this.globals.get(name);
        }
    }
    resolve(expr: Expr.Expr, depth: number): void {
        this.locals.set(expr,depth);
    };
    stringify(object: Object | null): string {
        if (object == null) return "nil";

        if (typeof object === "number"){
            if(Object.is(object,-0)) return "-0"; // special case since javascript's default toString() strips the leading -
            let text = object.toString();
            if (text.endsWith(".0")) {
                text = text.substring(0, text.length - 2);
            }
            return text!;
        }

        return object.toString();
    };
    visitArrExpr(expr: Expr.Arr): Object | null {
        const value: Array<any> = [];

        for (const e of expr.exprs){
            value.push(e);
        }

        return value;
    };
    visitAssignExpr(expr: Expr.Assign): Object | null {
        const value: Object | null = this.evaluate(expr.value);

        const distance: number | null = this.locals.get(expr) ?? null;
        if (distance !== null){
            this.environment.assignAt(distance,expr.name,value);
        } else {
            this.globals.assign(expr.name, value);
        }

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

                throw new RuntimeError(expr.operator, "Operands must be two numbers or two strings.");
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
    visitCallExpr(expr: Expr.Call): Object | null {
        const callee: Object | null = this.evaluate(expr.callee);

        const args: Array<Object | null> = [];

        for (let argument of expr.args){
            args.push(this.evaluate(argument));
        }

        if (!(callee instanceof LoxCallable)) {
            throw new RuntimeError(expr.paren,
                                  "Can only call functions and classes.");
        }

        const f: LoxCallable = callee as LoxCallable;
        if (args.length !== f.arity()) {
            throw new RuntimeError(expr.paren, `Expected ${f.arity()} arguments but got ${args.length}.`);
        }
        return f.loxcall(this, args);
    };
    visitClassStmt(stmt: Stmt.Class): void {
        let superclass: Object | null = null;

        if (stmt.superclass != null) {
            superclass = this.evaluate(stmt.superclass);
            if (!(superclass instanceof LoxClass)){
                throw new RuntimeError(stmt.superclass.name, "Superclass must be a class.");
            }
        }

        this.environment.define(stmt.name.lexeme, null);

        if(stmt.superclass !== null){
            this.environment = new Environment(this.environment);
            this.environment.define("super",superclass);
        }
        const methods: Map<string, LoxFunction> = new Map();
        for (let method of stmt.methods){
            const f: LoxFunction = new LoxFunction(method,this.environment,method.name.lexeme === "init");
            methods.set(method.name.lexeme, f);
        }
        const c: LoxClass = new LoxClass(stmt.name.lexeme, methods, superclass);

        if (superclass !== null){
            this.environment = this.environment.enclosing!;
        }

        this.environment.assign(stmt.name,c);
        return;
    };
    visitExpressionStmt(stmt: Stmt.Expression){
        this.evaluate(stmt.expression);
        return;
    };
    visitFunctionStmt(stmt: Stmt.Function): void {
        const f: LoxFunction = new LoxFunction(stmt, this.environment,false);
        this.environment.define(stmt.name.lexeme, f);
        return;
    };
    visitGetExpr(expr: Expr.Get): Object | null {
        const object: Object | null = this.evaluate(expr.object);

        if (object instanceof LoxInstance){
            return (object as LoxInstance).get(expr.name);
        }

        throw new RuntimeError(expr.name,"Only instances have properties.");
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
    visitReturnStmt(stmt: Stmt.Return): void {
        let value: Object | null = null;

        if (stmt.value !== null) value = this.evaluate(stmt.value);

        throw new Return(value);
    };
    visitSetExpr(expr: Expr.Set): Object | null {
        const object: Object | null = this.evaluate(expr.object);

        if (!(object instanceof LoxInstance)) {
            throw new RuntimeError(expr.name,"Only instances have fields.");
        }

        const value: Object | null = this.evaluate(expr.value);
        (object as LoxInstance).set(expr.name, value);
        return value;
    };
    visitSuperExpr(expr: Expr.Super): Object | null {
        const distance: number = this.locals.get(expr)!;
        const superclass: LoxClass | null = this.environment.getAt(distance,"super") as LoxClass | null;

        const object: LoxInstance = this.environment.getAt(distance - 1, "this") as LoxInstance;

        const method: LoxFunction | null = superclass?.findMethod(expr.method.lexeme) ?? null;
        if (method === null){
            throw new RuntimeError(expr.method,"Undefined property '" + expr.method.lexeme + "'.");
        }

        return method.bind(object)
    };
    visitThisExpr(expr: Expr.This): Object | null {
        return this.lookupVariable(expr.keyword,expr);
    };
    visitUnaryExpr(expr: Expr.Unary): Object | null {
        const right: Object | null = this.evaluate(expr.right);

        switch (expr.operator.type) {
            case TokenType.BANG:
                return !this.isTruthy(right);
            case TokenType.MINUS:
                this.checkNumberOperand(expr.operator, right);
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
        return this.lookupVariable(expr.name, expr);
    };
    visitWhileStmt(stmt: Stmt.While): void {
        while(this.isTruthy(this.evaluate(stmt.condition))) {
            this.execute(stmt.body);
        }
        return;
    };
}
