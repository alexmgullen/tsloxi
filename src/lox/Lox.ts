import readline from "node:readline/promises";
import fs from "node:fs";

import { AstPrinter } from "./AstPrinter.ts";
import { Expr } from "./Expr.ts";
import { Interpreter } from "./Interpreter.ts";
import { Parser } from "./Parser.ts";
import { RuntimeError } from "./RuntimeError.ts";
import { Scanner } from "./Scanner.ts";
import { Stmt } from "./Stmt.ts";
import { Token } from "./Token.ts";
import { TokenType } from "./TokenType.ts";

export class Lox {
    static hadError: boolean = false;
    static hadRuntimeError: boolean = false;

    static interpreter: Interpreter = new Interpreter();

    static runFile(path: string){
        const data = fs.readFileSync(path,'utf8');
        Lox.run(data);

        if (Lox.hadError) {
            process.exit(65);
        }
        
        if (Lox.hadRuntimeError) {
            process.exit(70);
        }
    }

    static async runPrompt(){
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        })

        for (;;){

            const line = await rl.question('> ')

            if (line == ""){
                break;
            }
            Lox.run(line);

            Lox.hadError = false;
        }
    }

    static main(args: string[]): number{
        if ( args.length > 3 ) {
            console.log("Usage: lox [script]");
        } else if ( args.length == 3 && typeof args[2] == "string"){
            Lox.runFile(args[2]);
        } else {
            Lox.runPrompt();
        }

        return 0;
    }
    static error(line: number, message: string): void;
    static error(token: Token, message: string): void;

    // Typescript doesn't handle overloading well, so this is what we have to do
    static error(lineOrToken: number | Token, message: string): void {
        if (typeof lineOrToken === "number"){
            const line = lineOrToken as number;
            Lox.report(line,"",message);
        } else if (typeof lineOrToken === "object"){
            const token = lineOrToken as Token;

            if(token.type == TokenType.EOF) {
                Lox.report(token.line, " at end",message);
            } else {
                Lox.report(token.line, " at '" + token.lexeme + "'",message);
            }
        }
    };
    static report(line: number,where: string,message:string){
        console.log("[line:",line,"] Error",where,":",message);
        Lox.hadError = true;
    }

    static run(source: string){
        const scanner: Scanner = new Scanner(source);
        const tokens: Token[] = scanner.scanTokens();
        const parser: Parser = new Parser(tokens);
        const statements: Stmt[] = parser.parse();

        if (!statements){
            this.hadError = true;
        }

        if(this.hadError) return;

        Lox.interpreter.interpret(statements!);
    };

    static runtimeError(error: RuntimeError){
        console.log(error.message + `[${error.token.line}]`);
        this.hadRuntimeError =  true;
    };
}

const args = process.argv;

Lox.main(args);
