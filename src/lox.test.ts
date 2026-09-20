import process from "node:process";
import stream from "node:stream";

import { Lox } from "./lox/Lox.ts";
import { AstPrinter } from "./lox/AstPrinter.ts";
import { Binary, Grouping, Literal, Unary } from "./lox/Expr.ts";
import { Expr } from "./lox/Expr.ts";
import { Token } from "./lox/Token.ts";
import { TokenType } from "./lox/TokenType.ts";

class Test {
    name: string;
    expectedOutput: string;
    action: () => void;
    constructor(name: string,expectedOutput: string, action: () => void){
        this.name = name;
        this.expectedOutput = expectedOutput;
        this.action = action;
    }
}

const tests: Test[] = [
    new Test('AST Printer prints correctly',`(* (- 123) (group 45.67))`, 
        () => {
            const expression = new Binary(
                new Unary(
                    new Token(TokenType.MINUS, "-", null, 1),
                    new Literal(123),
                ),
                new Token(TokenType.STAR, "*", null, 1),
                new Grouping(
                    new Literal(45.67),
                )
            );

        console.log(new AstPrinter().print(expression))
    }),

    new Test('variable scoping works correctly',
`inner a
outer b
global c
outer a
outer b
global c
global a
global b
global c`,
        () => Lox.run(`
                var a = "global a";
                var b = "global b";
                var c = "global c";
                {
                  var a = "outer a";
                  var b = "outer b";
                  {
                    var a = "inner a";
                    print a;
                    print b;
                    print c;
                  }
                  print a;
                  print b;
                  print c;
                }
                print a;
                print b;
                print c;
        `)
    ),

    new Test('Logical statements execute',`foo`,
        () => Lox.run(`
                if (true){
                    print "foo";
                }

                if (false) {
                    print "bar";
                }
        `)
    ),

    new Test('Logical statements without scope execute',`foo`,
        () => Lox.run(`
                if (true)
                    print "foo";


                if (false)
                    print "bar";
        `)
    ),

    new Test('Logical statements without scope do not interfere with other logical statements',`bar`,

        () => Lox.run(`
                if (false)
                    print "foo";


                if (true)
                    print "bar";
        `)
    ),

    new Test('Else is bounded to nearest if',
`a
c`,
        () => Lox.run(`
            if(true) print "a"; if (false) print "b"; else print "c";`
        )
    ),

    new Test('Truthyness value of print statement',
`hi
yes`,
        () => Lox.run(`
print "hi" or 2; // "hi"
print nil or "yes"; // "yes"
        `)
    ),

    new Test('While Loop',
`1
2
3
4
5`,
        () => Lox.run(`
var i = 0;
while (i < 5)
    print i;
    i = i + 1;
        `)
    ),
]

const default_output = process.stdout.write;

for (const test of tests){
    console.log('Running test: ', test.name);

    let output: string = '';

    // Monkey patch node's stdout destination to be captured by output string
    process.stdout.write = (chunk: string | Uint8Array<ArrayBufferLike>, encoding: any) => {
        output += chunk.toString();
        return true;
    }

    test.action();

    // Patch the original process back in.
    process.stdout.write = default_output;

    console.log("output: ",output);

    if (output.trim() === test.expectedOutput){
        console.log("Test Successful ✅");
    } else {
        console.log("Test failed ❌");
        console.log("expected output :",test.expectedOutput);
        console.log("actual output   :",output);
    }
}
