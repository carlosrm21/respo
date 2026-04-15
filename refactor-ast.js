const { Project, SyntaxKind } = require("ts-morph");

// Configurar proyecto ts-morph
const project = new Project();
project.addSourceFilesAtPaths("src/**/*.ts");
project.addSourceFilesAtPaths("src/**/*.tsx");

const files = project.getSourceFiles();

files.forEach(sourceFile => {
    let hasChanges = false;
    
    // Buscar llamadas directas a db.prepare(...).get() / .all() / .run()
    const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);
    
    // Primero, vamos a mapear en reverso para no perder las referencias AST
    const toReplace = [];

    callExpressions.forEach(call => {
        const expression = call.getExpression();
        if (expression.getKind() === SyntaxKind.PropertyAccessExpression) {
            const propertyAccess = expression; // e.g. db.prepare(...).get
            const caller = propertyAccess.getExpression(); // e.g. db.prepare(...)
            
            if (caller.getKind() === SyntaxKind.CallExpression) {
                const subCallerExp = caller.getExpression(); // db.prepare
                
                if (subCallerExp.getText() === "db.prepare") {
                    const sqlArg = caller.getArguments()[0];
                    const method = propertyAccess.getName(); // get, all, run
                    const execArgs = call.getArguments();
                    
                    toReplace.push({
                        node: call,
                        sqlText: sqlArg.getText(),
                        method: method,
                        argsText: execArgs.length > 0 ? execArgs.map(a => a.getText()) : null
                    });
                }
            }
        }
    });

    // Ahora evaluamos las llamadas que se dividieron, ej. const stmt = db.prepare(SQL); stmt.all();
    const varDecls = sourceFile.getDescendantsOfKind(SyntaxKind.VariableDeclaration);
    varDecls.forEach(decl => {
        const initializer = decl.getInitializer();
        if (initializer && initializer.getKind() === SyntaxKind.CallExpression && initializer.getExpression().getText() === "db.prepare") {
            const varName = decl.getName();
            const sqlText = initializer.getArguments()[0].getText();

            // Buscar todos los lugares donde se llama a `varName.all()` o `varName.get()`
            const methodCalls = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression).filter(c => {
                const expr = c.getExpression();
                return expr.getKind() === SyntaxKind.PropertyAccessExpression && expr.getExpression().getText() === varName;
            });

            methodCalls.forEach(call => {
                const propertyAccess = call.getExpression();
                const method = propertyAccess.getName();
                const execArgs = call.getArguments();
                
                toReplace.push({
                    node: call,
                    sqlText: sqlText,
                    method: method,
                    argsText: execArgs.length > 0 ? execArgs.map(a => a.getText()) : null
                });
            });

            // En este caso, como lo transformaremos en ejecución directa asíncrona, eliminamos la declaración de la variable 'stmt'
            toReplace.push({
                node: decl.getParentIfKind(SyntaxKind.VariableDeclarationList).getParentIfKind(SyntaxKind.VariableStatement) || decl,
                isDeclarationRemoval: true
            });
        }
    });

    // Reemplazar de abajo hacia arriba para no dañar índices
    toReplace.sort((a, b) => b.node.getPos() - a.node.getPos());

    toReplace.forEach(item => {
        if (item.isDeclarationRemoval) {
            try {
                item.node.remove();
                hasChanges = true;
            } catch (e) {}
            return;
        }

        const callArgs = item.argsText ? item.argsText.join(", ") : "";
        let execString = "";
        
        if (item.argsText && item.argsText.length > 0) {
            execString = `await db.execute({ sql: ${item.sqlText}, args: [${callArgs}] })`;
        } else {
            execString = `await db.execute(${item.sqlText})`;
        }

        let replacement = "";
        if (item.method === "get") {
            replacement = `(${execString}).rows[0]`;
        } else if (item.method === "all") {
            replacement = `(${execString}).rows`;
        } else if (item.method === "run") {
            replacement = `${execString}`;
        }

        if (replacement) {
            item.node.replaceWithText(replacement);
            hasChanges = true;
        }
    });

    // Fix imports si usamos async map en utilidades
    sourceFile.getDescendantsOfKind(SyntaxKind.FunctionDeclaration).forEach(func => {
        if (hasChanges && !func.isAsync() && func.getText().includes('await db')) {
            func.setIsAsync(true);
        }
    });

    // Also arrow functions and method declarations
    sourceFile.getDescendantsOfKind(SyntaxKind.ArrowFunction).forEach(func => {
        if (hasChanges && !func.isAsync() && func.getText().includes('await db')) {
            func.setIsAsync(true);
        }
    });

    if (hasChanges) {
        sourceFile.saveSync();
        console.log("Refactoreo con AST completo y exitoso en:", sourceFile.getFilePath());
    }
});
