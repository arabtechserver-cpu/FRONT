const fs = require('fs');
let code = fs.readFileSync('src/components/admin/DashboardProvider.jsx', 'utf8');

const target = `      if (tab === "orders") {
        requests.push(loadOrders(), loadWalletTransactions());`;

const replacement = `      if (tab === "orders") {
        requests.push(loadOrders(), loadWalletTransactions(), loadApiProviders());`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/components/admin/DashboardProvider.jsx', code);
    console.log("Fixed tab orders");
} else {
    console.log("Target not found!");
}
