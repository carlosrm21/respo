const fs = require('fs');
const path = require('path');

const srcDir = path.join('e:', 'APP INVENTARIO', 'app restaurante', 'restaurante-web', 'src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(srcDir);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    if (!content.includes('db.prepare')) return;

    // Replace multiline backticks first if assigned to variables or executed inline.
    // Handling multi-line queries is tricky with simple regex if they contain nested parens.
    // But since our AST mostly uses: db.prepare(`...`).get(...) we can capture correctly.

    // Pattern 1: .get(...)
    content = content.replace(/db\.prepare\((['`"][\s\S]*?['`"])\)\.get\((.*?)\)/g, (match, sql, args) => {
        if (args.trim() === '') {
            return `(await db.execute(${sql})).rows[0]`;
        }
        return `(await db.execute({ sql: ${sql}, args: [${args}] })).rows[0]`;
    });

    // Pattern 2: .all(...)
    content = content.replace(/db\.prepare\((['`"][\s\S]*?['`"])\)\.all\((.*?)\)/g, (match, sql, args) => {
        if (args.trim() === '') {
            return `(await db.execute(${sql})).rows`;
        }
        return `(await db.execute({ sql: ${sql}, args: [${args}] })).rows`;
    });

    // Pattern 3: .run(...)
    content = content.replace(/db\.prepare\((['`"][\s\S]*?['`"])\)\.run\((.*?)\)/g, (match, sql, args) => {
        if (args.trim() === '') {
            return `(await db.execute(${sql}))`;
        }
        return `(await db.execute({ sql: ${sql}, args: [${args}] }))`;
    });

    // Pattern 4: const stmt = ...; stmt.run(...) or stmt.all()
    // Regex matching assignment and subsequent call
    content = content.replace(/const\s+(\w+)\s*=\s*db\.prepare\((['`"][\s\S]*?['`"])\);\s*(?:const\s+(\w+)\s*=\s*)?\1\.(all|get|run)\((.*?)\);/gs, (match, stmtVar, sql, resultVar, method, args) => {
        let execution = '';
        if (args.trim() === '') {
             execution = `await db.execute(${sql})`;
        } else {
             execution = `await db.execute({ sql: ${sql}, args: [${args}] })`;
        }

        if (method === 'run') {
            return resultVar ? `const ${resultVar} = ${execution};` : `${execution};`;
        } else if (method === 'all') {
            return resultVar ? `const { rows: ${resultVar} } = ${execution};` : `${execution};`;
        } else if (method === 'get') {
            return resultVar ? `const ${resultVar} = (${execution}).rows[0];` : `(${execution}).rows[0];`;
        }
    });

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Refactored ${file}`);
    }
});
