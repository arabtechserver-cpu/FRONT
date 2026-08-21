import test from "node:test";
import assert from "node:assert/strict";
import { formatWalletTransaction } from "../src/lib/walletTransactions.mjs";

test("formats real wallet transactions without inventing values", async () => {
  const credit = formatWalletTransaction({ type: "credit", amount: 12.5, description: "إيداع" });
  const debit = formatWalletTransaction({ type: "debit", amount: -3, description: "شراء" });
  assert.equal(credit.signedAmount, "+12.50");
  assert.equal(debit.signedAmount, "-3.00");
  assert.equal(credit.description, "إيداع");
});
