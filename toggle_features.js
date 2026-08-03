const fs = require('fs');
const path = require('path');

const featuresFilePath = path.join(__dirname, 'src', 'features.js');

const args = process.argv.slice(2);
const command = args[0] ? args[0].toLowerCase() : '';
const option = args[1] ? args[1].toLowerCase() : '';

let content = fs.readFileSync(featuresFilePath, 'utf8');

let showApi = /showApiDocs:\s*(true|false)/.exec(content)?.[1] === 'true';
let showProt = /showProtectionModal:\s*(true|false)/.exec(content)?.[1] === 'true';

if (command === 'api') {
  if (option === 'on' || option === 'show' || option === 'true') showApi = true;
  else if (option === 'off' || option === 'hide' || option === 'false') showApi = false;
  else showApi = !showApi;
} else if (command === 'protection' || command === 'prot' || command === 'bot') {
  if (option === 'on' || option === 'show' || option === 'true') showProt = true;
  else if (option === 'off' || option === 'hide' || option === 'false') showProt = false;
  else showProt = !showProt;
} else if (command === 'hide-api') {
  showApi = false;
} else if (command === 'show-api') {
  showApi = true;
} else if (command === 'hide-protection') {
  showProt = false;
} else if (command === 'show-protection') {
  showProt = true;
} else if (command === 'hide-all') {
  showApi = false;
  showProt = false;
} else if (command === 'show-all') {
  showApi = true;
  showProt = true;
} else {
  // Default action: toggle API links status
  showApi = !showApi;
}

const updatedContent = `export const FEATURES = {\n  // Set to false to hide API docs and API reseller links across the site\n  showApiDocs: ${showApi},\n  // Set to true to enable the protection verification overlay modal\n  showProtectionModal: ${showProt},\n};\n`;

fs.writeFileSync(featuresFilePath, updatedContent, 'utf8');

console.log('\n==================================================');
console.log('  🎯 تم تحديث حالة الميزات في الموقع بنجاح:');
console.log('==================================================');
console.log(`  🔌 رابط الـ API ورابط الموزعين (showApiDocs): ${showApi ? '🟢 مـفـعـل (يـظـهـر الآن)' : '🔴 مـخـفـي (معطل الآن)'}`);
console.log(`  🛡️ شاشة حماية الإنسانية والربوت (showProtectionModal): ${showProt ? '🟢 مـفـعـلـة (تظهر الآن)' : '🔴 مـعـطـلـة (مخفية)'}`);
console.log('==================================================\n');
