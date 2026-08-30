const fs = require('fs');
let code = fs.readFileSync('src/components/ReferralModal.js', 'utf8');

const target = `    useEffect(() => {
    if (customerUser && !sessionStorage.getItem("referral_modal_shown")) {
      setIsOpen(true);
      sessionStorage.setItem("referral_modal_shown", "true");
    }`;

const replacement = `    useEffect(() => {
    if (customerUser) {
      setIsOpen(true);
    }`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/components/ReferralModal.js', code);
    console.log("Replaced useEffect condition");
} else {
    console.log("Target not found!");
}
