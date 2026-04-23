const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('e:/APP INVENTARIO/app restaurante/restaurante-web/src/components/LandingUI.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

const rawJSXPath = path.resolve('scratch/rawJSX.txt');
const safeJSX = fs.readFileSync(rawJSXPath, 'utf8');

const returnMatch = content.match(/  return \([\r\n\s]+<main/);
if (returnMatch) {
    const returnIndex = returnMatch.index;
    const newContent = content.substring(0, returnIndex) + safeJSX + '\n}\n';
    fs.writeFileSync(targetFile, newContent, 'utf8');
    console.log('✅ LandingUI.tsx updated successfully with pure text replacement.');
} else {
    console.log('❌ Could not find main return statement in LandingUI.tsx');
}
