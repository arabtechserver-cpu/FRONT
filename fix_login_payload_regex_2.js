const fs = require('fs');
let code = fs.readFileSync('src/app/login/page.js', 'utf8');

code = code.replace(
    /ref: localStorage.getItem\('ref_code'\)/,
    `referred_by_code: localStorage.getItem('ref_code')`
);

fs.writeFileSync('src/app/login/page.js', code);
console.log("Fixed referred_by_code");
