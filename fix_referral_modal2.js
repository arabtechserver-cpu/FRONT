const fs = require('fs');
let code = fs.readFileSync('src/components/ReferralModal.js', 'utf8');

code = code.replace(/if \(customerUser && !sessionStorage\.getItem\("referral_modal_shown"\)\) \{[\s\S]*?setIsOpen\(true\);[\s\S]*?sessionStorage\.setItem\("referral_modal_shown", "true"\);[\s\S]*?\}/, `if (customerUser) {\n      setIsOpen(true);\n    }`);

fs.writeFileSync('src/components/ReferralModal.js', code);
console.log("Replaced using regex");
