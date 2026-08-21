const fs = require('fs');
let code = fs.readFileSync('src/app/login/page.js', 'utf8');

const target = `body: JSON.stringify({ credential: response.credential })`;
const replacement = `body: JSON.stringify({ credential: response.credential, referred_by_code: localStorage.getItem('ref_code') })`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/app/login/page.js', code);
    console.log("Fixed google auth payload");
} else {
    console.log("Target not found!");
}
