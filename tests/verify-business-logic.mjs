import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const dbFile = path.join(process.cwd(), "prisma", "dev.db");
if (fs.existsSync(dbFile)) {
  fs.unlinkSync(dbFile);
}

const {
  getPlatformSnapshot,
  fundCustomerWallet,
  upsertRepaymentParameter,
  applyForLoanWithStandingOrder,
  approveAndDisburseLoanToWallet,
  rejectLoanApplication,
  executeStandingOrderDeduction,
  runBatchStandingOrderCycle,
  applyForSmartCard,
  fundSmartCardFromWallet,
  manageSmartCard,
} = await import("../src/lib/db.ts");

console.log("=== 1. Verifying Initial Seed & Wallet Reserve Accounting ===");
let snap = getPlatformSnapshot("usr_adaeze");
assert.equal(snap.wallet.balance, 425000);
assert.equal(snap.wallet.lockedBalance, 11050);
assert.equal(snap.wallet.availableBalance, 413950);
console.log("✓ Seed state & available balance verified.");

console.log("=== 2. Verifying Prepaid Wallet Funding (Flutterwave Gateway) ===");
const fundRes = await fundCustomerWallet({
  userId: "usr_adaeze",
  amount: 75000,
  paymentChannel: "BANK_TRANSFER",
});
assert.equal(fundRes.balanceBefore, 425000);
assert.equal(fundRes.balanceAfter, 500000);
snap = getPlatformSnapshot("usr_adaeze");
assert.equal(snap.wallet.balance, 500000);
assert.equal(snap.wallet.availableBalance, 500000 - 11050);
console.log("✓ Prepaid Wallet Funding verified.");

console.log("=== 3. Verifying Super Admin Repayment Parameter Creation ===");
const newParam = upsertRepaymentParameter({
  name: "Test 3-Cycle Odd Division Facility",
  code: "DBC-TEST-3C",
  category: "PERSONAL_LOAN",
  interestRatePercent: 3.33,
  repaymentFrequency: "MONTHLY",
  tenureCount: 3,
  minAmount: 50000,
  maxAmount: 1000000,
  gracePeriodDays: 2,
  latePenaltyPercent: 2.0,
  minWalletReservePercent: 10.0,
  minCreditScore: 600,
});
assert.ok(newParam.id);
console.log("✓ Super Admin Repayment Parameter created:", newParam.id);

console.log("=== 4. Verifying Loan Application + Standing Order & Exact Amortization ===");
// Reject if Standing Order is not authorized
assert.throws(() =>
  applyForLoanWithStandingOrder({
    userId: "usr_adaeze",
    repaymentParameterId: newParam.id,
    principalAmount: 100000,
    purpose: "Should fail without standing order consent",
    standingOrderAuthorized: false,
  })
);

const loanApp = applyForLoanWithStandingOrder({
  userId: "usr_adaeze",
  repaymentParameterId: newParam.id,
  principalAmount: 100000,
  purpose: "Working capital odd-division test",
  standingOrderAuthorized: true,
});
snap = getPlatformSnapshot("usr_adaeze");
const createdLoan = snap.userLoans.find((l) => l.id === loanApp.loanId);
assert.ok(createdLoan);
const scheduleSum = createdLoan.schedules.reduce(
  (acc, s) => acc + Number(s.totalAmount),
  0
);
const principalSum = createdLoan.schedules.reduce(
  (acc, s) => acc + Number(s.principalPortion),
  0
);
const interestSum = createdLoan.schedules.reduce(
  (acc, s) => acc + Number(s.interestPortion),
  0
);
assert.equal(
  scheduleSum,
  createdLoan.totalPayable,
  "Schedule installments must sum to exact totalPayable with zero rounding drift"
);
assert.equal(principalSum, 100000);
assert.equal(interestSum, createdLoan.interestAmount);
assert.equal(
  snap.wallet.lockedBalance,
  11050 + loanApp.reservedAmount,
  "Wallet lockedBalance must include new Standing Order reserve"
);
console.log("✓ Exact amortization & Standing Order reserve lock verified.");

console.log("=== 5. Verifying Super Admin Loan Approval & Wallet Disbursement ===");
const disbRes = approveAndDisburseLoanToWallet({
  loanApplicationId: loanApp.loanId,
});
assert.equal(disbRes.disbursedAmount, 100000);
assert.equal(disbRes.newWalletBalance, 600000);
console.log("✓ Loan principal disbursed directly into Customer Wallet.");

console.log("=== 6. Verifying Standing Order Repayment Lifecycle & Reserve Release ===");
const soId = createdLoan.standingOrder.id;
const step1 = executeStandingOrderDeduction({ standingOrderId: soId });
const step2 = executeStandingOrderDeduction({ standingOrderId: soId });
const step3 = executeStandingOrderDeduction({ standingOrderId: soId });
assert.equal(step1.outcome, "SUCCESS");
assert.equal(step2.outcome, "SUCCESS");
assert.equal(step3.outcome, "SUCCESS");
assert.equal(step3.loanStatus, "REPAID");
assert.equal(step3.remainingLoanBalance, 0);
assert.equal(step3.reserveReleased, loanApp.reservedAmount);

snap = getPlatformSnapshot("usr_adaeze");
assert.equal(
  snap.wallet.lockedBalance,
  11050,
  "Completed Standing Order must release its locked reserve back to available wallet balance"
);
console.log("✓ Standing Order full repayment & reserve release verified.");

console.log("=== 7. Verifying Super Admin Loan Rejection & Reserve Unlock ===");
const rejectableLoan = applyForLoanWithStandingOrder({
  userId: "usr_adaeze",
  repaymentParameterId: newParam.id,
  principalAmount: 120000,
  purpose: "Test rejection unlock",
  standingOrderAuthorized: true,
});
snap = getPlatformSnapshot("usr_adaeze");
assert.equal(snap.wallet.lockedBalance, 11050 + rejectableLoan.reservedAmount);
rejectLoanApplication({ loanApplicationId: rejectableLoan.loanId });
snap = getPlatformSnapshot("usr_adaeze");
assert.equal(
  snap.wallet.lockedBalance,
  11050,
  "Rejecting a loan must unlock its Standing Order reserve"
);
console.log("✓ Loan rejection & reserve unlock verified.");

console.log("=== 8. Verifying Virtual & Physical Smart Cards (Flutterwave Gateway) ===");
const cardRes = await applyForSmartCard({
  userId: "usr_adaeze",
  cardType: "VIRTUAL",
  cardBrand: "VISA",
  cardTier: "GOLD_EXECUTIVE",
  initialFundingAmount: 15000,
  creditLineLinked: true,
});
assert.ok(cardRes.flutterwaveCardId);
const topUpRes = await fundSmartCardFromWallet({
  cardId: cardRes.cardId,
  amount: 5000,
});
assert.equal(topUpRes.newCardBalance, 20000);
const freezeRes = await manageSmartCard({
  cardId: cardRes.cardId,
  action: "FREEZE",
});
assert.equal(freezeRes.status, "FROZEN");
console.log("✓ Flutterwave Smart Card issuance, funding, and freeze verified.");

console.log("=== 9. Verifying Batch Standing Order Cycle ===");
const batchRes = runBatchStandingOrderCycle();
assert.ok(batchRes.processedCount >= 1);
console.log("✓ Batch Standing Order Cycle verified:", batchRes);

// Clean up dev.db so the initial seed state is fresh for the application
for (const ext of ["", "-wal", "-shm"]) {
  const f = dbFile + ext;
  if (fs.existsSync(f)) fs.unlinkSync(f);
}
console.log("\nALL BUSINESS LOGIC TESTS PASSED PERFECTLY!");
