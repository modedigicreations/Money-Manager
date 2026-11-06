import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const projectDir = path.resolve(import.meta.dirname, "..");
process.chdir(projectDir);
const dbFile = path.join(projectDir, "prisma", "dev.db");
if (fs.existsSync(dbFile)) {
  fs.unlinkSync(dbFile);
}

const {
  getPlatformSnapshot,
  authenticateUser,
  registerCustomerAccount,
  createTeamMemberAccount,
  fundCustomerWallet,
  confirmAndCreditWalletPayment,
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

console.log("=== 10. Verifying Customer Signup, Separate Login Routing & Super Admin Team Member Creation ===");
// 10a. Customer Registration creates customer + wallet and routes to CUSTOMER_DASHBOARD
const regRes = registerCustomerAccount({
  fullName: "Ngozi Obi",
  email: "ngozi.obi@dbcapital.ng",
  phone: "+234 806 111 2233",
  password: "MySecurePassword123",
  accountType: "INDIVIDUAL",
  bvn: "22334455667",
  nin: "66554433221",
});
assert.equal(regRes.user.role, "CUSTOMER");
assert.equal(regRes.dashboardRoute, "CUSTOMER_DASHBOARD");
assert.ok(regRes.walletAccountNumber);
const ngoziSnap = getPlatformSnapshot(regRes.user.id);
assert.equal(ngoziSnap.currentUser.email, "ngozi.obi@dbcapital.ng");
assert.equal(ngoziSnap.wallet.accountNumber, regRes.walletAccountNumber);

// 10b. Customer Login routes to CUSTOMER_DASHBOARD
const custLogin = authenticateUser({
  email: "ngozi.obi@dbcapital.ng",
  password: "MySecurePassword123",
});
assert.equal(custLogin.user.role, "CUSTOMER");
assert.equal(custLogin.dashboardRoute, "CUSTOMER_DASHBOARD");

// 10c. Super Admin Login routes to ADMIN_DASHBOARD
const adminLogin = authenticateUser({
  email: "superadmin@dbcapital.ng",
  password: "Admin@123",
});
assert.equal(adminLogin.user.role, "SUPER_ADMIN");
assert.equal(adminLogin.dashboardRoute, "ADMIN_DASHBOARD");

// 10d. Super Admin creates a Team Member account, and Team Member logs in to ADMIN_DASHBOARD
const teamRes = createTeamMemberAccount({
  creatorUserId: adminLogin.user.id,
  fullName: "Kemi Adeyemi",
  email: "kemi.adeyemi@dbcapital.ng",
  phone: "+234 809 555 6677",
  password: "TeamPassword@2026",
  role: "TEAM_MEMBER",
  department: "Back Office & Treasury",
});
assert.equal(teamRes.teamMember.role, "TEAM_MEMBER");
const teamLogin = authenticateUser({
  email: "kemi.adeyemi@dbcapital.ng",
  password: "TeamPassword@2026",
});
assert.equal(teamLogin.user.role, "TEAM_MEMBER");
assert.equal(teamLogin.dashboardRoute, "ADMIN_DASHBOARD");
console.log("✓ Customer registration, login separation, and Super Admin team member creation verified.");

console.log("=== 11. Verifying Live Paystack & Flutterwave Webhook/Callback Settlement & Idempotency ===");
const paystackRef = "PSK-LIVE-REF-900100";
const settle1 = confirmAndCreditWalletPayment({
  gatewayReference: paystackRef,
  gatewayProvider: "PAYSTACK_LIVE",
  amount: 75000,
  channel: "BANK_TRANSFER",
  userId: regRes.user.id,
  walletAccountNumber: regRes.walletAccountNumber,
  customerEmail: "ibrahim.musa@example.com",
});
assert.equal(settle1.alreadyProcessed, false);
assert.equal(settle1.amountCredited, 75000);
assert.equal(settle1.balanceAfter, 75000);

// Replay same reference (webhook + callback idempotency check)
const settle1Replay = confirmAndCreditWalletPayment({
  gatewayReference: paystackRef,
  gatewayProvider: "PAYSTACK_LIVE",
  amount: 75000,
  channel: "BANK_TRANSFER",
  userId: regRes.user.id,
});
assert.equal(settle1Replay.alreadyProcessed, true);
assert.equal(settle1Replay.balanceAfter, 75000);

const flwRef = "FLW-LIVE-REF-900200";
const settle2 = confirmAndCreditWalletPayment({
  gatewayReference: flwRef,
  gatewayProvider: "FLUTTERWAVE_LIVE",
  amount: 25000,
  channel: "CARD",
  walletAccountNumber: regRes.walletAccountNumber,
});
assert.equal(settle2.alreadyProcessed, false);
assert.equal(settle2.balanceAfter, 100000);
console.log("✓ Live Paystack & Flutterwave payment settlement & idempotency verified.");

// Clean up dev.db so the initial seed state is fresh for the application
for (const ext of ["", "-wal", "-shm"]) {
  const f = dbFile + ext;
  if (fs.existsSync(f)) fs.unlinkSync(f);
}
console.log("\nALL BUSINESS LOGIC TESTS PASSED PERFECTLY!");
