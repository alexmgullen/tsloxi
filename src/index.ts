import readline from "node:readline/promises";
import fs from "node:fs";

const args = process.argv

class lox {
    static hadError: boolean = false;

    static runFile(path: string){
        const data = fs.readFileSync(path,'utf8');
        lox.run(data);

        if (lox.hadError) {
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
            lox.run(line);

            lox.hadError = false;
        }
    }

    static main(): number{
        if ( args.length > 3 ) {
            console.log("Usage: lox [script]");
        } else if ( args.length == 3 && typeof args[2] == "string"){
            lox.runFile(args[2]);
        } else {
            lox.runPrompt();
        }

        return 0;
    }

    static error(line:number,message:string){
        lox.report(line,"",message);
    }

    static report(line: number,where: string,message:string){
        console.log("[line:",line,"] Error",where,":",message);
        lox.hadError = true;
    }

    static run(script: string){
        const tokens: string[] = script.split('');

        for (const token of tokens){
            console.log(token)
        }
    };
}

lox.main();
