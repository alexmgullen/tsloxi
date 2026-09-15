import fs from "node:fs";

// the book mentions that they get "lazy" when it comes to string manipulation to define this code, this is the non lazy implementation since I found it easier than trying to use exclusively string manipulation.
class ClassDefinition {
    name: string;
    parameters: ParameterDefinition[];
    constructor(name: string, parameters: ParameterDefinition[]){
        this.name = name;
        this.parameters = parameters;
    }
}

class ParameterDefinition {
    name: string;
    type: string;

    constructor(name: string, type: string){
        this.name = name;
        this.type = type;
    }
}

export class GenerateAst {
    static main(args: string[]): number{
        if (args.length != 3){
            console.log("Usage: node <path_to_file>/GenerateAst.ts <output_directory>");
            process.exit(64);
        }

        const outputDir: string = args[2]!;

        this.defineAst(outputDir,"Expr",[
            new ClassDefinition("Binary",[
                new ParameterDefinition("left","Expr"),
                new ParameterDefinition("operator","TokenType"),
                new ParameterDefinition("right","Expr"),

            ]),

            new ClassDefinition("Grouping",[
                new ParameterDefinition("expression","Expr"),
            ]),
            
            new ClassDefinition("Literal",[
                new ParameterDefinition("value","any"),
            ]),
            
            new ClassDefinition("Unary",[
                new ParameterDefinition("operator","TokenType"),
                new ParameterDefinition("right","Expr"),
            ]),
        ]);

        return 0;
    };
    static defineAst(outputDir: string, baseName: string, types: ClassDefinition[]){
        const path: string = outputDir + "/" + baseName + ".ts";
        const stream = fs.createWriteStream(path,{ encoding: 'utf8'})
        
        stream.write('import { TokenType } from "./TokenType.ts"\n');

        //nodejs doesn't have a writeline interface so we need to add the newline ourselves
        stream.write('interface ' + baseName + '{\n');
       
        // also, since typescript doesn't need children to be in the parent interface (which is equivalent to an abstract class here) we'll close this interface before defining the child classes;
        stream.write('}\n');

        for (const t of types){
            GenerateAst.defineType(stream, baseName, t.name, t.parameters);
        }
    }
    static defineType(stream: fs.WriteStream, baseName: string, className: string, fields: ParameterDefinition[]){
        stream.write("export class " + className + " implements " + baseName + " {\n");

        // fields
        for (const field of fields){
            stream.write("    " + field.name + " : " + field.type + ";\n");
        }


        //constructor
        stream.write("    constructor(");
        for (const field of fields){
            stream.write(field.name + ": " +field.type + ",")
        }
        stream.write(") {\n");

        for (const field of fields){
            stream.write("        this." + field.name + " = " + field.name + ";\n");
        }
        
        stream.write("    }\n")

        stream.write("}\n")

    }
}

const args = process.argv

GenerateAst.main(args);
