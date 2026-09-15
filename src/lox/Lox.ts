import readline from "node:readline/promises";
import fs from "node:fs";

import { Scanner } from "./Scanner.ts";
import { Token } from "./Token.ts";

const args = process.argv

export class Lox {
    static hadError: boolean = false;

    static runFile(path: string){
        const data = fs.readFileSync(path,'utf8');
        Lox.run(data);

        if (Lox.hadError) {
            process.exit(65);
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

    static main(): number{
        if ( args.length > 3 ) {
            console.log("Usage: lox [script]");
        } else if ( args.length == 3 && typeof args[2] == "string"){
            Lox.runFile(args[2]);
        } else {
            Lox.runPrompt();
        }

        return 0;
    }

    static error(line:number,message:string){
        Lox.report(line,"",message);
    }

    static report(line: number,where: string,message:string){
        console.log("[line:",line,"] Error",where,":",message);
        Lox.hadError = true;
    }

    static run(source: string){
        const scanner: Scanner = new Scanner(source);
        const tokens: Token[] = scanner.scanTokens();

        for (const token of tokens){
            console.log(token)
        }
    };
}

Lox.main();
