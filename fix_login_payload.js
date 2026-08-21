const fs = require('fs');
let code = fs.readFileSync('src/app/login/page.js', 'utf8');

const target = `    const bodyObj = activeTab === "login" 
      ? { username, password, 'cf-turnstile-response': turnstileToken } 
      : { username, email, password, phone, 'cf-turnstile-response': turnstileToken };`;

const replacement = `    const bodyObj = activeTab === "login" 
      ? { username, password, 'cf-turnstile-response': turnstileToken } 
      : { username, email, password, phone, 'cf-turnstile-response': turnstileToken, ref: localStorage.getItem('ref_code') };`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/app/login/page.js', code);
    console.log("Fixed login bodyObj");
} else {
    console.log("Target not found!");
}
