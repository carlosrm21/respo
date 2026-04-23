const fs = require('fs');

let code = fs.readFileSync('src/lib/opsData.ts', 'utf-8');

// 1. Add requireTenant helper at the top
const requireTenantCode = `import { cookies } from 'next/headers';

export async function requireTenant() {
  const cookieStore = await cookies();
  const tenantId = cookieStore.get('tenant_id')?.value;
  if (!tenantId) throw new Error('TENANT_MISSING');
  return tenantId;
}
`;

if (!code.includes('requireTenant')) {
  code = code.replace(
    /import \{ getSupabaseAdmin.*?;/,
    requireTenantCode + `\nimport { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabaseAdmin';`
  );
}

// 2. Add tenantId to all function signatures starting from the first export function
const fnMatches = [...code.matchAll(/export\s+async\s+function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*\{/g)];

for (const match of fnMatches) {
  const fnName = match[1];
  if (fnName === 'seedSupabaseOperationalData') continue;

  const getSupaBlock = /const supabase = requireSupabase\(\);/;
  
  // Find where the function body starts
  const blockStartIdx = match.index + match[0].length;
  // Get slice between this func and next func
  const nextFnMatch = fnMatches.find(m => m.index > match.index);
  const blockEndIdx = nextFnMatch ? nextFnMatch.index : code.length;
  
  let functionCode = code.slice(blockStartIdx, blockEndIdx);
  
  // Inject tenant required
  if (!functionCode.includes('requireTenant()')) {
    functionCode = functionCode.replace(getSupaBlock, `const tenantId = await requireTenant();\n  const supabase = requireSupabase();`);
  }
  
  // Now modify all queries inside this function.
  // SELECTIONS, DELETIONS, UPDATES: supabase.from('...').select/update/delete -> append .eq('restaurante_id', tenantId)
  functionCode = functionCode.replace(/\.from\('([^']+)'\)\s*\.select\(/g, ".from('$1').select(");
  functionCode = functionCode.replace(/\.from\('([^']+)'\)\s*\.update\(/g, ".from('$1').update(");
  functionCode = functionCode.replace(/\.from\('([^']+)'\)\s*\.delete\(/g, ".from('$1').delete(");
  functionCode = functionCode.replace(/\.from\('([^']+)'\)\s*\.upsert\(/g, ".from('$1').upsert(");
  
  // Using a simpler approach: any supabase.from('x') is assigned to a chain. We can intercept and inject.
  functionCode = functionCode.replace(/supabase\s*\n?\s*\.from\('([^']+)'\)/g, "supabase.from('$1').eq('restaurante_id', tenantId)");

  // EXCEPTION: inserts! .insert({}) must contain restaurante_id: tenantId. 
  // Wait, if it has .eq('restaurante_id', tenantId), insert will break in Supabase v2.
  // Instead of modifying `.from()`, let's just use AST or manual replacements for inserts?
  // Let's do it safer: find `.insert({` and change to `.insert({ restaurante_id: tenantId, `
  functionCode = functionCode.replace(/\.insert\(\{(.*?)\}\)/gs, (match, interior) => {
    return `.insert({ restaurante_id: tenantId, ${interior} })`;
  });
  
  // If .insert receives an array map `.insert(rows.map(...))`
  functionCode = functionCode.replace(/\.insert\((.*?)\.map\(\((.*?)\)\s*=>\s*(\{.*?\})\)\)/gs, (match, arrayName, params, obj) => {
    // Inject into the object
    const newObj = obj.replace(/\{/, '{ restaurante_id: tenantId, ');
    return `.insert(${arrayName}.map((${params}) => (${newObj})))`;
  });
  
  // Manual fix for specific arrays like .insert([ { ...}, {... } ])
  // It's getting complicated. Let's write functionCode back.
  code = code.slice(0, blockStartIdx) + functionCode + code.slice(blockEndIdx);
}

fs.writeFileSync('src/lib/opsData.ts.new', code);
console.log('Created opsData.ts.new');
