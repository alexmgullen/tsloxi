import readline from "node:readline/promises";
import fs from "node:fs";

const args = process.argv

function runFile(path: string){
    const data = fs.readFileSync(path,'utf8');
    run(data);
}

async function runPrompt(){
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })

    for (;;){

        const line = await rl.question('> ')

        if (line == ""){
            break;
        }
        run(line);
    }
}

if ( args.length > 3 ) {
    console.log("Usage: lox [script]");
} else if ( args.length == 3 && typeof args[2] == "string"){
    runFile(args[2]);
} else {
    runPrompt();
}

function run(script: string){
    console.log("not implemented")
};
