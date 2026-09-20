default: build run

run:
	node dist/index.js

build: lint
	npx rolldown src/lox/Lox.ts --file dist/index.js

test: lint
	npx rolldown src/lox.test.js --file dist/test.index.js
	node dist/test.index.js

lint:
	npx tsc --noemit

ast:
	node src/tool/GenerateAst.ts

