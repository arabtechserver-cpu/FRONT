export function formatWalletTransaction(transaction) {
  const amount = Number(transaction?.amount || 0);
  const type = String(transaction?.type || "").toLowerCase();
  const isCredit = ["debit", "withdraw", "purchase", "order", "deduct"].includes(type)
    ? false
    : ["credit", "deposit", "recharge", "add"].includes(type) || amount >= 0;
  return { ...transaction, amount, isCredit, signedAmount: `${isCredit ? "+" : "-"}${Math.abs(amount).toFixed(2)}`, statusLabel: "مكتمل" };
}
