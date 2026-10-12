const fs = require('fs');
const path = require('path');
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(file) : file.endsWith('.tsx') ? [file] : [];
  });
}
const tokens = new Set();
for (const file of [...walk('src/app/(admin)'), ...walk('src/components/admin')]) {
  const source = fs.readFileSync(file, 'utf8');
  for (const match of source.matchAll(/(?<![\w:-])(?:dark:)?(?:(?:hover|focus|focus-visible|placeholder):)?(?:bg|text|border|divide)-(?:white|(?:slate|gray|zinc|stone|neutral)-(?:50|[1-9]00|950))(?:\/\d+)?(?![\w-])/g)) tokens.add(match[0]);
}
const groups = new Map();
for (const token of [...tokens].sort()) {
  const plain = token.replace(/^dark:/, '').replace(/^(?:hover|focus|focus-visible|placeholder):/, '');
  const [, property, family, shadeText, alphaText] = plain.match(/^(bg|text|border|divide)-(white|slate|gray|zinc|stone|neutral)(?:-(\d+))?(?:\/(\d+))?$/) || [];
  if (family === 'white' && property === 'text') continue;
  const shade = Number(shadeText || 50);
  const color = property === 'text' ? (shade >= 700 ? 'var(--on-surface)' : 'var(--on-surface-variant)')
    : ['border', 'divide'].includes(property) ? 'var(--outline-variant)'
    : shade <= 50 ? 'var(--surface-container)' : shade <= 200 ? 'var(--surface-container-high)' : 'var(--surface-container-lowest)';
  const alpha = alphaText ? Number(alphaText) / 100 : property === 'bg' ? 'var(--tw-bg-opacity, 1)' : property === 'border' || property === 'divide' ? '.55' : 1;
  const declaration = `${property === 'bg' ? 'background-color' : property === 'text' ? 'color' : 'border-color'}: rgb(${color} / ${alpha});`;
  const state = token.match(/(?:^|:)(hover|focus|focus-visible|placeholder):/);
  const suffix = state ? state[1] === 'placeholder' ? '::placeholder' : `:${state[1]}` : '';
  const exclusion = token.startsWith('dark:') ? '' : `:not([class*="dark:${state ? state[1] + ':' : ''}${property}-"])`;
  const selector = `.admin-theme [class~="${token}"]${exclusion}${suffix}${property === 'divide' ? ' > :not([hidden]) ~ :not([hidden])' : ''}`;
  if (!groups.has(declaration)) groups.set(declaration, []);
  groups.get(declaration).push(selector);
}
const rules = [...groups].map(([declaration, selectors]) => selectors.join(',\n') + ` { ${declaration} }`);
fs.writeFileSync('src/styles/admin-theme-utilities.css', '/* Administrative neutral surfaces. Regenerate with:\n * node scripts/generate-admin-theme-utilities.cjs\n */\n' + rules.join('\n\n') + '\n');
console.log(`${tokens.size} admin color utilities in ${rules.length} groups`);
