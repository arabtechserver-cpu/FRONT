const fs = require('fs');
let code = fs.readFileSync('src/app/login/page.js', 'utf8');

code = code.replace(
    /const bodyObj = activeTab === "login"([\s\S]*?)\? \{ username, password, 'cf-turnstile-response': turnstileToken \}([\s\S]*?): \{ username, email, password, phone, 'cf-turnstile-response': turnstileToken \};/,
    `const bodyObj = activeTab === "login"$1? { username, password, 'cf-turnstile-response': turnstileToken }$2: { username, email, password, phone, 'cf-turnstile-response': turnstileToken, ref: localStorage.getItem('ref_code') };`
);

fs.writeFileSync('src/app/login/page.js', code);
console.log("Replaced with regex");
