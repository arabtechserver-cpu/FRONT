const fs = require('fs');
const path = require('path');
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(file) : file.endsWith('.tsx') ? [file] : [];
  });
}
const files = [...walk('src/app/(main)'), ...walk('src/components').filter(f => !f.includes(`${path.sep}admin${path.sep}`))];
const tokens = new Set();
for (const file of files) {
  let source = fs.readFileSync(file, 'utf8');
  for (const match of source.matchAll(/(?<![\w:-])(?:dark:)?(?:(?:hover|focus|focus-visible|placeholder):)?(?:bg|text|border|from|via|to|ring)-(?:white|(?:slate|gray|blue|sky|cyan|indigo|violet|purple)-(?:50|[1-9]00|950))(?:\/\d+)?(?![\w-])/g)) tokens.add(match[0]);
}
const groups = new Map();
for (const token of [...tokens].sort()) {
  const plain = token.replace(/^dark:/, '').replace(/^(?:hover|focus|focus-visible|placeholder):/, '');
  const [, property, family, shadeText, alphaText] = plain.match(/^(bg|text|border|from|via|to|ring)-(white|slate|gray|blue|sky|cyan|indigo|violet|purple)(?:-(\d+))?(?:\/(\d+))?$/) || [];
  if (!property) continue;
  if (family === 'white' && property === 'text') continue;
  const shade = Number(shadeText || 50);
  const neutral = ['white', 'slate', 'gray'].includes(family);
  let color;
  if (neutral) {
    color = property === 'text' ? (shade >= 700 ? 'var(--on-surface)' : 'var(--on-surface-variant)')
      : property === 'border' ? 'var(--outline-variant)'
      : shade <= 50 ? 'var(--surface-container)' : shade <= 200 ? 'var(--surface-container-high)' : 'var(--surface-container-lowest)';
  } else {
    color = property === 'text' ? '255 171 144' : property === 'border' || property === 'ring' ? '150 75 83'
      : shade <= 200 || shade >= 900 ? '84 30 51' : shade <= 400 ? '255 171 144' : shade <= 600 ? '185 25 50' : '150 23 46';
  }
  const alpha = alphaText ? Number(alphaText) / 100 : property === 'bg' ? 'var(--tw-bg-opacity, 1)' : 1;
  const rgb = `rgb(${color} / ${alpha})`;
  let declarations = property === 'bg' ? `background-color: ${rgb};` : property === 'text' ? `color: ${rgb};`
    : property === 'border' ? `border-color: ${rgb};` : property === 'ring' ? `--tw-ring-color: ${rgb};`
    : property === 'from' ? `--tw-gradient-from: ${rgb} var(--tw-gradient-from-position); --tw-gradient-to: rgb(${color} / 0) var(--tw-gradient-to-position); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);`
    : property === 'via' ? `--tw-gradient-to: rgb(${color} / 0) var(--tw-gradient-to-position); --tw-gradient-stops: var(--tw-gradient-from), ${rgb} var(--tw-gradient-via-position), var(--tw-gradient-to);`
    : `--tw-gradient-to: ${rgb} var(--tw-gradient-to-position);`;
  const state = token.match(/(?:^|:)(hover|focus|focus-visible|placeholder):/);
  const suffix = state ? state[1] === 'placeholder' ? '::placeholder' : `:${state[1]}` : '';
  const darkPrefix = token.startsWith('dark:');
  const exclusion = darkPrefix ? '' : `:not([class*="dark:${state ? state[1] + ':' : ''}${property}-"])`;
  const selector = `.dark .user-theme [class~="${token}"]${exclusion}${suffix}`;
  if (!groups.has(declarations)) groups.set(declarations, []);
  groups.get(declarations).push(selector);
}
const rules = [...groups].map(([declarations, selectors]) => selectors.join(',\n') + ` { ${declarations} }`);
fs.writeFileSync('src/styles/user-theme-utilities.css', '/* Customer dark palette for existing Tailwind color utilities.\n * Regenerate from frontend with: node scripts/generate-user-theme-utilities.cjs\n */\n' + rules.join('\n\n') + '\n');
console.log(`${tokens.size} scoped color utilities in ${rules.length} groups`);
