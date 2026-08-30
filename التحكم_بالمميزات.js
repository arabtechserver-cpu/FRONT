const fs = require('fs');
const path = require('path');

const featuresFilePath = path.join(__dirname, 'src', 'features.js');

const args = process.argv.slice(2);
const command = args[0] ? args[0].toLowerCase() : '';
const option = args[1] ? args[1].toLowerCase() : '';

let content = fs.readFileSync(featuresFilePath, 'utf8');

let showApi = /showApiDocs:\s*(true|false)/.exec(content)?.[1] === 'true';
let showProt = /showProtectionModal:\s*(true|false)/.exec(content)?.[1] === 'true';

if (command === 'api' || command === 'الربط' || command === 'الموزعين') {
  if (option === 'on' || option === 'show' || option === 'true' || option === 'اظهار' || option === 'إظهار' || option === 'تفعيل') showApi = true;
  else if (option === 'off' || option === 'hide' || option === 'false' || option === 'اخفاء' || option === 'إخفاء' || option === 'تعطيل') showApi = false;
  else showApi = !showApi;
} else if (command === 'protection' || command === 'prot' || command === 'bot' || command === 'الحماية' || command === 'شاشة_الحماية') {
  if (option === 'on' || option === 'show' || option === 'true' || option === 'اظهار' || option === 'إظهار' || option === 'تفعيل') showProt = true;
  else if (option === 'off' || option === 'hide' || option === 'false' || option === 'اخفاء' || option === 'إخفاء' || option === 'تعطيل') showProt = false;
  else showProt = !showProt;
} else if (command === 'اخفاء_الربط' || command === 'إخفاء_الربط') {
  showApi = false;
} else if (command === 'اظهار_الربط' || command === 'إظهار_الربط') {
  showApi = true;
} else if (command === 'اخفاء_الحماية' || command === 'إخفاء_الحماية') {
  showProt = false;
} else if (command === 'اظهار_الحماية' || command === 'إظهار_الحماية') {
  showProt = true;
} else if (command === 'اخفاء_الكل' || command === 'إخفاء_الكل') {
  showApi = false;
  showProt = false;
} else if (command === 'اظهار_الكل' || command === 'إظهار_الكل') {
  showApi = true;
  showProt = true;
} else {
  // Toggle API status by default if no subcommand provided
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
