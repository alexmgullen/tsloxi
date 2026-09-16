default: build run

run:
	node dist/index.js

build: lint
	npx rolldown src/lox/Lox.ts --file dist/index.js

test: lint
	npx rolldown src/Test.ts --file dist/test.ts
	node dist/test.ts

lint:
	npx tsc --noemit

ast:
	node src/tool/GenerateAst.ts

