import { DatabaseSync } from "node:sqlite";
import crypto from "node:crypto";
import path from "node:path";
import fs from "node:fs";
import { flutterwaveGateway } from "./gateway/flutterwave-adapter.ts";

const dbDir = path.join(process.cwd(), "prisma");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}
const dbPath = path.join(dbDir, "dev.db");

// Singleton SQLite connection across Next.js hot reloads
const globalForDb = globalThis as unknown as {
  __dbCapitalSqlite?: DatabaseSync;
};

let seqCounter = 100;
function uniqueSuffix(): string {
  seqCounter = (seqCounter + 1) % 999999;
  const rand = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `${Date.now().toString().slice(-5)}${seqCounter}${rand}`;
}

function withTransaction<T>(db: DatabaseSync, fn: () => T): T {
  db.exec("BEGIN IMMEDIATE;");
  try {
    const result = fn();
    db.exec("COMMIT;");
    return result;
  } catch (err) {
    db.exec("ROLLBACK;");
    throw err;
  }
}

export function getDb(): DatabaseSync {
  if (!globalForDb.__dbCapitalSqlite) {
    const db = new DatabaseSync(dbPath);
    db.exec("PRAGMA journal_mode = WAL;");
    db.exec("PRAGMA foreign_keys = ON;");
    initializeSchemaAndSeed(db);
    globalForDb.__dbCapitalSqlite = db;
  }
  return globalForDb.__dbCapitalSqlite;
}

function initializeSchemaAndSeed(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS User (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      fullName TEXT NOT NULL,
      phone TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'CUSTOMER',
      accountType TEXT NOT NULL DEFAULT 'INDIVIDUAL',
      businessName TEXT,
      rcNumber TEXT,
      bvn TEXT,
      nin TEXT,
      kycStatus TEXT NOT NULL DEFAULT 'VERIFIED',
      kycTier INTEGER NOT NULL DEFAULT 2,
      creditScore INTEGER NOT NULL DEFAULT 720,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Wallet (
      id TEXT PRIMARY KEY,
      userId TEXT UNIQUE NOT NULL,
      accountNumber TEXT UNIQUE NOT NULL,
      bankName TEXT NOT NULL DEFAULT 'DB Capital / Wema Virtual',
      currency TEXT NOT NULL DEFAULT 'NGN',
      balance REAL NOT NULL DEFAULT 0,
      lockedBalance REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES User(id)
    );

    CREATE TABLE IF NOT EXISTS LedgerTransaction (
      id TEXT PRIMARY KEY,
      walletId TEXT NOT NULL,
      reference TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      balanceBefore REAL NOT NULL,
      balanceAfter REAL NOT NULL,
      description TEXT NOT NULL,
      gatewayProvider TEXT NOT NULL DEFAULT 'FLUTTERWAVE_MOCK',
      gatewayReference TEXT,
      status TEXT NOT NULL DEFAULT 'SUCCESS',
      metadataJson TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (walletId) REFERENCES Wallet(id)
    );

    CREATE TABLE IF NOT EXISTS RepaymentParameter (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      interestRatePercent REAL NOT NULL,
      repaymentFrequency TEXT NOT NULL,
      tenureCount INTEGER NOT NULL,
      minAmount REAL NOT NULL,
      maxAmount REAL NOT NULL,
      gracePeriodDays INTEGER NOT NULL DEFAULT 2,
      latePenaltyPercent REAL NOT NULL DEFAULT 1.5,
      minWalletReservePercent REAL NOT NULL DEFAULT 10.0,
      minCreditScore INTEGER NOT NULL DEFAULT 600,
      autoDisburseOnApproval INTEGER NOT NULL DEFAULT 1,
      isActive INTEGER NOT NULL DEFAULT 1,
      updatedBy TEXT NOT NULL DEFAULT 'Super Admin',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS LoanApplication (
      id TEXT PRIMARY KEY,
      reference TEXT UNIQUE NOT NULL,
      userId TEXT NOT NULL,
      repaymentParameterId TEXT NOT NULL,
      purpose TEXT NOT NULL,
      principalAmount REAL NOT NULL,
      interestAmount REAL NOT NULL,
      totalPayable REAL NOT NULL,
      amountPaid REAL NOT NULL DEFAULT 0,
      remainingBalance REAL NOT NULL,
      installmentAmount REAL NOT NULL,
      tenureCount INTEGER NOT NULL,
      frequency TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'UNDER_REVIEW',
      adminNotes TEXT,
      disbursedAt TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES User(id),
      FOREIGN KEY (repaymentParameterId) REFERENCES RepaymentParameter(id)
    );

    CREATE TABLE IF NOT EXISTS StandingOrder (
      id TEXT PRIMARY KEY,
      mandateReference TEXT UNIQUE NOT NULL,
      userId TEXT NOT NULL,
      walletId TEXT NOT NULL,
      repaymentParameterId TEXT NOT NULL,
      loanApplicationId TEXT UNIQUE,
      frequency TEXT NOT NULL,
      installmentAmount REAL NOT NULL,
      reservedAmount REAL NOT NULL DEFAULT 0,
      totalInstallments INTEGER NOT NULL,
      completedInstallments INTEGER NOT NULL DEFAULT 0,
      failedAttempts INTEGER NOT NULL DEFAULT 0,
      nextExecutionDate TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      authorizedAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES User(id),
      FOREIGN KEY (repaymentParameterId) REFERENCES RepaymentParameter(id),
      FOREIGN KEY (loanApplicationId) REFERENCES LoanApplication(id)
    );

    CREATE TABLE IF NOT EXISTS StandingOrderExecution (
      id TEXT PRIMARY KEY,
      standingOrderId TEXT NOT NULL,
      installmentNumber INTEGER NOT NULL,
      amountAttempted REAL NOT NULL,
      walletBalanceAtRun REAL NOT NULL,
      status TEXT NOT NULL,
      ledgerTxReference TEXT,
      notes TEXT NOT NULL,
      executedAt TEXT NOT NULL,
      FOREIGN KEY (standingOrderId) REFERENCES StandingOrder(id)
    );

    CREATE TABLE IF NOT EXISTS RepaymentSchedule (
      id TEXT PRIMARY KEY,
      loanApplicationId TEXT NOT NULL,
      installmentNumber INTEGER NOT NULL,
      dueDate TEXT NOT NULL,
      principalPortion REAL NOT NULL,
      interestPortion REAL NOT NULL,
      totalAmount REAL NOT NULL,
      penaltyAmount REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'PENDING',
      paidAt TEXT,
      txReference TEXT,
      FOREIGN KEY (loanApplicationId) REFERENCES LoanApplication(id)
    );

    CREATE TABLE IF NOT EXISTS SmartCard (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      cardType TEXT NOT NULL,
      cardBrand TEXT NOT NULL DEFAULT 'MASTERCARD',
      cardTier TEXT NOT NULL DEFAULT 'GOLD_EXECUTIVE',
      maskedPan TEXT NOT NULL,
      fullPanMock TEXT NOT NULL,
      cvvMock TEXT NOT NULL,
      expiryMonth TEXT NOT NULL,
      expiryYear TEXT NOT NULL,
      cardholderName TEXT NOT NULL,
      currency TEXT NOT NULL DEFAULT 'NGN',
      cardBalance REAL NOT NULL DEFAULT 0,
      spendingLimit REAL NOT NULL DEFAULT 1500000,
      creditLineLinked INTEGER NOT NULL DEFAULT 0,
      flutterwaveCardId TEXT UNIQUE NOT NULL,
      gatewayMode TEXT NOT NULL DEFAULT 'FLUTTERWAVE_MOCK',
      deliveryAddress TEXT,
      deliveryStatus TEXT,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES User(id)
    );
  `);

  // Ensure reservedAmount column exists if migrating an older dev.db
  const soCols = db.prepare("PRAGMA table_info(StandingOrder)").all() as Array<{
    name: string;
  }>;
  if (!soCols.some((c) => c.name === "reservedAmount")) {
    db.exec(
      "ALTER TABLE StandingOrder ADD COLUMN reservedAmount REAL NOT NULL DEFAULT 0;"
    );
  }

  const countRow = db
    .prepare("SELECT COUNT(*) as cnt FROM User")
    .get() as { cnt: number };
  if (countRow.cnt > 0) {
    return;
  }

  const now = new Date("2026-11-06T09:00:00Z").toISOString();

  // 1. Seed Users (2 Customers: 1 Individual, 1 SME Business + 1 Super Admin)
  const insertUser = db.prepare(`
    INSERT INTO User (id, email, fullName, phone, role, accountType, businessName, rcNumber, bvn, nin, kycStatus, kycTier, creditScore, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertUser.run(
    "usr_adaeze",
    "adaeze.okafor@dbcapital.ng",
    "Adaeze Okafor",
    "+234 803 451 9920",
    "CUSTOMER",
    "INDIVIDUAL",
    null,
    null,
    "22481904812",
    "59102948172",
    "VERIFIED",
    3,
    765,
    now
  );

  insertUser.run(
    "usr_tunde_biz",
    "tunde@lagostradelink.ng",
    "Tunde Balogun",
    "+234 809 220 7145",
    "CUSTOMER",
    "BUSINESS",
    "Lagos TradeLink Logistics Ltd",
    "RC-1894021",
    "22391049581",
    "61029485712",
    "VERIFIED",
    3,
    790,
    now
  );

  insertUser.run(
    "usr_superadmin",
    "superadmin@dbcapital.ng",
    "Chukwuma Nwosu (Chief Risk & Super Admin)",
    "+234 802 100 0001",
    "SUPER_ADMIN",
    "BUSINESS",
    "DB Capital Credit and Loan HQ",
    "RC-1000001",
    "22100000001",
    "50000000001",
    "VERIFIED",
    3,
    850,
    now
  );

  // 2. Seed Wallets
  // Adaeze: active installment is 110,500; 10% reserve = 11,050
  // Tunde: active installment is 295,000; 12% reserve = 35,400
  const insertWallet = db.prepare(`
    INSERT INTO Wallet (id, userId, accountNumber, bankName, currency, balance, lockedBalance, status, updatedAt)
    VALUES (?, ?, ?, ?, 'NGN', ?, ?, 'ACTIVE', ?)
  `);

  insertWallet.run(
    "wal_adaeze",
    "usr_adaeze",
    "7820194821",
    "DB Capital / Flutterwave Wema Virtual",
    425000,
    11050,
    now
  );

  insertWallet.run(
    "wal_tunde",
    "usr_tunde_biz",
    "7820559104",
    "DB Capital / Flutterwave Wema Virtual",
    1850000,
    35400,
    now
  );

  // 3. Seed Super Admin Repayment Parameters
  const insertParam = db.prepare(`
    INSERT INTO RepaymentParameter (
      id, name, code, category, interestRatePercent, repaymentFrequency,
      tenureCount, minAmount, maxAmount, gracePeriodDays, latePenaltyPercent,
      minWalletReservePercent, minCreditScore, autoDisburseOnApproval, isActive, updatedBy, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 'Super Admin', ?, ?)
  `);

  insertParam.run(
    "prm_personal_flexi",
    "Personal Flexi Salary & Growth Loan",
    "DBC-PL-3M",
    "PERSONAL_LOAN",
    3.5, // 3.5% flat per installment cycle
    "MONTHLY",
    3,
    50000,
    2500000,
    2,
    1.5,
    10.0,
    620,
    now,
    now
  );

  insertParam.run(
    "prm_personal_weekly",
    "Micro Express Weekly Credit",
    "DBC-PL-4W",
    "PERSONAL_LOAN",
    1.8, // 1.8% per week
    "WEEKLY",
    4,
    20000,
    500000,
    1,
    2.0,
    15.0,
    580,
    now,
    now
  );

  insertParam.run(
    "prm_biz_working_cap",
    "SME Working Capital & Inventory Finance",
    "DBC-BF-6M",
    "BUSINESS_FINANCE",
    3.0, // 3.0% monthly
    "MONTHLY",
    6,
    500000,
    15000000,
    3,
    1.25,
    12.0,
    680,
    now,
    now
  );

  insertParam.run(
    "prm_smartcard_credit",
    "DB Capital Smart Card Revolving Credit Line",
    "DBC-SC-BIW",
    "SMART_CARD_CREDIT",
    2.2, // 2.2% bi-weekly
    "BIWEEKLY",
    4,
    100000,
    3000000,
    2,
    1.5,
    10.0,
    650,
    now,
    now
  );

  // 4. Seed Active Disbursed Loan + Standing Order for Adaeze (and a Pending Review Loan for Tunde)
  const insertLoan = db.prepare(`
    INSERT INTO LoanApplication (
      id, reference, userId, repaymentParameterId, purpose,
      principalAmount, interestAmount, totalPayable, amountPaid, remainingBalance,
      installmentAmount, tenureCount, frequency, status, adminNotes, disbursedAt, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertLoan.run(
    "ln_adaeze_01",
    "DBC-LN-2026-0891",
    "usr_adaeze",
    "prm_personal_flexi",
    "Home solar inverter upgrade & working equipment",
    300000,
    31500,
    331500,
    110500,
    221000,
    110500,
    3,
    "MONTHLY",
    "APPROVED_DISBURSED",
    "KYC Tier 3 verified. Standing order mandate active on wallet 7820194821.",
    "2026-10-06T10:30:00Z",
    "2026-10-06T10:00:00Z"
  );

  const insertStandingOrder = db.prepare(`
    INSERT INTO StandingOrder (
      id, mandateReference, userId, walletId, repaymentParameterId, loanApplicationId,
      frequency, installmentAmount, reservedAmount, totalInstallments, completedInstallments,
      failedAttempts, nextExecutionDate, status, authorizedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertStandingOrder.run(
    "so_adaeze_01",
    "DBC-SO-MND-88412",
    "usr_adaeze",
    "wal_adaeze",
    "prm_personal_flexi",
    "ln_adaeze_01",
    "MONTHLY",
    110500,
    11050,
    3,
    1,
    0,
    "2026-11-06",
    "ACTIVE",
    "2026-10-06T10:00:00Z"
  );

  const insertSchedule = db.prepare(`
    INSERT INTO RepaymentSchedule (
      id, loanApplicationId, installmentNumber, dueDate,
      principalPortion, interestPortion, totalAmount, penaltyAmount, status, paidAt, txReference
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertSchedule.run(
    "sch_ada_1",
    "ln_adaeze_01",
    1,
    "2026-10-25",
    100000,
    10500,
    110500,
    0,
    "PAID",
    "2026-10-25T08:00:00Z",
    "DBC-TX-SO-1002"
  );
  insertSchedule.run(
    "sch_ada_2",
    "ln_adaeze_01",
    2,
    "2026-11-06",
    100000,
    10500,
    110500,
    0,
    "PENDING",
    null,
    null
  );
  insertSchedule.run(
    "sch_ada_3",
    "ln_adaeze_01",
    3,
    "2026-12-06",
    100000,
    10500,
    110500,
    0,
    "PENDING",
    null,
    null
  );

  insertLoan.run(
    "ln_tunde_01",
    "DBC-LN-2026-0942",
    "usr_tunde_biz",
    "prm_biz_working_cap",
    "Fleet cold-chain expansion & port clearing credit",
    1500000,
    270000,
    1770000,
    0,
    1770000,
    295000,
    6,
    "MONTHLY",
    "UNDER_REVIEW",
    "Standing Order pre-authorized by customer. Ready for Super Admin disbursement.",
    null,
    "2026-11-05T14:20:00Z"
  );

  insertStandingOrder.run(
    "so_tunde_01",
    "DBC-SO-MND-99104",
    "usr_tunde_biz",
    "wal_tunde",
    "prm_biz_working_cap",
    "ln_tunde_01",
    "MONTHLY",
    295000,
    35400,
    6,
    0,
    0,
    "2026-12-05",
    "ACTIVE",
    "2026-11-05T14:20:00Z"
  );

  for (let i = 1; i <= 6; i++) {
    const dueMonth = i === 1 ? "2026-12-05" : `2027-0${i - 1}-05`;
    insertSchedule.run(
      `sch_tun_${i}`,
      "ln_tunde_01",
      i,
      dueMonth,
      250000,
      45000,
      295000,
      0,
      "PENDING",
      null,
      null
    );
  }

  // 5. Seed StandingOrderExecution log
  db.prepare(`
    INSERT INTO StandingOrderExecution (
      id, standingOrderId, installmentNumber, amountAttempted, walletBalanceAtRun, status, ledgerTxReference, notes, executedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    "soe_01",
    "so_adaeze_01",
    1,
    110500,
    535500,
    "SUCCESS",
    "DBC-TX-SO-1002",
    "Automated wallet standing order deduction for Installment #1 (DBC-PL-3M)",
    "2026-10-25T08:00:00Z"
  );

  // 6. Seed Ledger Transactions
  const insertLedger = db.prepare(`
    INSERT INTO LedgerTransaction (
      id, walletId, reference, type, category, amount, balanceBefore, balanceAfter,
      description, gatewayProvider, gatewayReference, status, metadataJson, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'SUCCESS', ?, ?)
  `);

  insertLedger.run(
    "tx_ada_01",
    "wal_adaeze",
    "DBC-TX-WF-1000",
    "CREDIT",
    "WALLET_FUNDING",
    285500,
    0,
    285500,
    "Prepaid Wallet Funding via Flutterwave Gateway (Bank Transfer)",
    "FLUTTERWAVE_MOCK",
    "FLW-DBC-WF-8829104",
    JSON.stringify({ channel: "BANK_TRANSFER" }),
    "2026-10-05T11:15:00Z"
  );

  insertLedger.run(
    "tx_ada_02",
    "wal_adaeze",
    "DBC-TX-LD-1001",
    "CREDIT",
    "LOAN_DISBURSEMENT",
    300000,
    285500,
    585500,
    "Loan Disbursement to Wallet — Personal Flexi Loan (DBC-LN-2026-0891)",
    "INTERNAL_LEDGER",
    "DBC-LN-2026-0891",
    JSON.stringify({ loanId: "ln_adaeze_01", mandate: "DBC-SO-MND-88412" }),
    "2026-10-06T10:30:00Z"
  );

  insertLedger.run(
    "tx_ada_03",
    "wal_adaeze",
    "DBC-TX-CF-1001B",
    "DEBIT",
    "CARD_FUNDING",
    50000,
    585500,
    535500,
    "Flutterwave Virtual Smart Card Initial Funding (5399 **** **** 8492)",
    "FLUTTERWAVE_MOCK",
    "FLW-CRD-8492",
    JSON.stringify({ cardType: "VIRTUAL" }),
    "2026-10-12T15:40:00Z"
  );

  insertLedger.run(
    "tx_ada_04",
    "wal_adaeze",
    "DBC-TX-SO-1002",
    "DEBIT",
    "STANDING_ORDER_REPAYMENT",
    110500,
    535500,
    425000,
    "Standing Order Repayment #1/3 — Mandate DBC-SO-MND-88412 (DBC-LN-2026-0891)",
    "STANDING_ORDER_ENGINE",
    "DBC-SO-MND-88412",
    JSON.stringify({ installment: 1, totalInstallments: 3 }),
    "2026-10-25T08:00:00Z"
  );

  insertLedger.run(
    "tx_tun_01",
    "wal_tunde",
    "DBC-TX-WF-2001",
    "CREDIT",
    "WALLET_FUNDING",
    1850000,
    0,
    1850000,
    "Corporate Prepaid Wallet Funding via Flutterwave Gateway",
    "FLUTTERWAVE_MOCK",
    "FLW-DBC-WF-9918271",
    JSON.stringify({ channel: "BANK_TRANSFER" }),
    "2026-11-01T09:30:00Z"
  );

  // 7. Seed Flutterwave Smart Cards (1 Virtual + 1 Physical)
  const insertCard = db.prepare(`
    INSERT INTO SmartCard (
      id, userId, cardType, cardBrand, cardTier, maskedPan, fullPanMock, cvvMock,
      expiryMonth, expiryYear, cardholderName, currency, cardBalance, spendingLimit,
      creditLineLinked, flutterwaveCardId, gatewayMode, deliveryAddress, deliveryStatus, status, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'NGN', ?, ?, ?, ?, 'FLUTTERWAVE_MOCK', ?, ?, 'ACTIVE', ?)
  `);

  insertCard.run(
    "crd_adaeze_virtual",
    "usr_adaeze",
    "VIRTUAL",
    "MASTERCARD",
    "GOLD_EXECUTIVE",
    "5399 **** **** 8492",
    "5399 4821 9034 8492",
    "419",
    "08",
    "29",
    "ADAEZE OKAFOR",
    50000,
    1500000,
    1,
    "flw_card_dbc_v8492",
    null,
    "N/A",
    "2026-10-12T15:40:00Z"
  );

  insertCard.run(
    "crd_adaeze_physical",
    "usr_adaeze",
    "PHYSICAL",
    "VERVE",
    "GOLD_EXECUTIVE",
    "5061 **** **** 3310",
    "5061 0942 7718 3310",
    "805",
    "11",
    "30",
    "ADAEZE OKAFOR",
    125000,
    3000000,
    1,
    "flw_card_dbc_p3310",
    "Plot 14 Admiralty Way, Lekki Phase 1, Lagos",
    "DELIVERED",
    "2026-10-18T11:20:00Z"
  );

  insertCard.run(
    "crd_tunde_physical",
    "usr_tunde_biz",
    "PHYSICAL",
    "MASTERCARD",
    "PLATINUM_BUSINESS",
    "5399 **** **** 9104",
    "5399 8810 4421 9104",
    "672",
    "10",
    "29",
    "LAGOS TRADELINK LTD",
    450000,
    10000000,
    1,
    "flw_card_dbc_p9104",
    "22 Marina Road, Lagos Island, Lagos",
    "DISPATCHED",
    "2026-11-02T16:10:00Z"
  );
}

// ============================================================================
// Domain Service Operations
// ============================================================================

export function getPlatformSnapshot(selectedUserId = "usr_adaeze") {
  const db = getDb();

  const users = db.prepare("SELECT * FROM User ORDER BY createdAt ASC").all();
  const currentUser =
    db.prepare("SELECT * FROM User WHERE id = ?").get(selectedUserId) ||
    users[0];

  const wallet = db
    .prepare("SELECT * FROM Wallet WHERE userId = ?")
    .get((currentUser as { id: string }).id) as Record<string, unknown>;

  wallet.availableBalance = Math.max(
    0,
    Number(wallet.balance) - Number(wallet.lockedBalance)
  );

  const transactions = db
    .prepare(
      "SELECT * FROM LedgerTransaction WHERE walletId = ? ORDER BY createdAt DESC"
    )
    .all(wallet.id as string);

  const repaymentParameters = db
    .prepare(
      "SELECT * FROM RepaymentParameter ORDER BY category ASC, createdAt ASC"
    )
    .all();

  const userLoans = db
    .prepare(
      `SELECT l.*, p.name as parameterName, p.code as parameterCode, p.interestRatePercent, p.latePenaltyPercent, p.gracePeriodDays
       FROM LoanApplication l
       JOIN RepaymentParameter p ON l.repaymentParameterId = p.id
       WHERE l.userId = ?
       ORDER BY l.createdAt DESC`
    )
    .all((currentUser as { id: string }).id) as Array<Record<string, unknown>>;

  for (const loan of userLoans) {
    loan.schedules = db
      .prepare(
        "SELECT * FROM RepaymentSchedule WHERE loanApplicationId = ? ORDER BY installmentNumber ASC"
      )
      .all(loan.id as string);
    loan.standingOrder = db
      .prepare("SELECT * FROM StandingOrder WHERE loanApplicationId = ?")
      .get(loan.id as string);
  }

  const userStandingOrders = db
    .prepare(
      `SELECT so.*, p.name as parameterName, p.code as parameterCode, p.latePenaltyPercent,
              l.reference as loanReference, l.status as loanStatus, l.remainingBalance as loanRemainingBalance
       FROM StandingOrder so
       JOIN RepaymentParameter p ON so.repaymentParameterId = p.id
       LEFT JOIN LoanApplication l ON so.loanApplicationId = l.id
       WHERE so.userId = ?
       ORDER BY so.authorizedAt DESC`
    )
    .all((currentUser as { id: string }).id) as Array<Record<string, unknown>>;

  for (const so of userStandingOrders) {
    so.executions = db
      .prepare(
        "SELECT * FROM StandingOrderExecution WHERE standingOrderId = ? ORDER BY executedAt DESC"
      )
      .all(so.id as string);
  }

  const userCards = db
    .prepare(
      "SELECT * FROM SmartCard WHERE userId = ? ORDER BY createdAt DESC"
    )
    .all((currentUser as { id: string }).id);

  // Admin Back-Office Aggregations
  const allLoans = db
    .prepare(
      `SELECT l.*, u.fullName as customerName, u.email as customerEmail, u.accountType, u.creditScore,
              w.accountNumber as walletAccountNumber, w.balance as walletBalance,
              p.name as parameterName, p.code as parameterCode, p.interestRatePercent,
              so.mandateReference, so.status as standingOrderStatus, so.completedInstallments, so.totalInstallments, so.nextExecutionDate
       FROM LoanApplication l
       JOIN User u ON l.userId = u.id
       JOIN Wallet w ON w.userId = u.id
       JOIN RepaymentParameter p ON l.repaymentParameterId = p.id
       LEFT JOIN StandingOrder so ON so.loanApplicationId = l.id
       ORDER BY l.createdAt DESC`
    )
    .all() as Array<Record<string, unknown>>;

  for (const loan of allLoans) {
    loan.schedules = db
      .prepare(
        "SELECT * FROM RepaymentSchedule WHERE loanApplicationId = ? ORDER BY installmentNumber ASC"
      )
      .all(loan.id as string);
  }

  const allStandingOrders = db
    .prepare(
      `SELECT so.*, u.fullName as customerName, w.accountNumber as walletAccountNumber, w.balance as walletBalance,
              p.name as parameterName, p.code as parameterCode, p.latePenaltyPercent,
              l.reference as loanReference, l.status as loanStatus, l.remainingBalance
       FROM StandingOrder so
       JOIN User u ON so.userId = u.id
       JOIN Wallet w ON so.walletId = w.id
       JOIN RepaymentParameter p ON so.repaymentParameterId = p.id
       LEFT JOIN LoanApplication l ON so.loanApplicationId = l.id
       ORDER BY so.authorizedAt DESC`
    )
    .all() as Array<Record<string, unknown>>;

  for (const so of allStandingOrders) {
    so.executions = db
      .prepare(
        "SELECT * FROM StandingOrderExecution WHERE standingOrderId = ? ORDER BY executedAt DESC"
      )
      .all(so.id as string);
  }

  const allCards = db
    .prepare(
      `SELECT c.*, u.fullName as customerName, u.email as customerEmail, w.accountNumber as walletAccountNumber
       FROM SmartCard c
       JOIN User u ON c.userId = u.id
       JOIN Wallet w ON w.userId = u.id
       ORDER BY c.createdAt DESC`
    )
    .all();

  const allTransactions = db
    .prepare(
      `SELECT t.*, w.accountNumber as walletAccountNumber, u.fullName as customerName
       FROM LedgerTransaction t
       JOIN Wallet w ON t.walletId = w.id
       JOIN User u ON w.userId = u.id
       ORDER BY t.createdAt DESC
       LIMIT 50`
    )
    .all();

  const allWallets = db
    .prepare(
      `SELECT w.*, u.fullName as customerName, u.email as customerEmail, u.accountType, u.kycStatus, u.creditScore
       FROM Wallet w
       JOIN User u ON w.userId = u.id
       ORDER BY w.balance DESC`
    )
    .all();

  return {
    gatewayStatus: flutterwaveGateway.getGatewayStatus(),
    users,
    currentUser,
    wallet,
    transactions,
    repaymentParameters,
    userLoans,
    userStandingOrders,
    userCards,
    admin: {
      allLoans,
      allStandingOrders,
      allCards,
      allTransactions,
      allWallets,
    },
  };
}

/**
 * 1. Fund Prepaid Wallet via Flutterwave Gateway
 */
export async function fundCustomerWallet(params: {
  userId: string;
  amount: number;
  paymentChannel: "CARD" | "BANK_TRANSFER" | "USSD";
}) {
  const db = getDb();
  const amount = Number(params.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Funding amount must be greater than 0 NGN.");
  }

  const user = db
    .prepare("SELECT * FROM User WHERE id = ?")
    .get(params.userId) as Record<string, unknown> | undefined;
  if (!user) throw new Error("Customer not found.");

  const wallet = db
    .prepare("SELECT * FROM Wallet WHERE userId = ?")
    .get(params.userId) as Record<string, unknown> | undefined;
  if (!wallet) throw new Error("Customer wallet not found.");
  if (wallet.status !== "ACTIVE") {
    throw new Error("Customer wallet is not active.");
  }

  const gatewayRes = await flutterwaveGateway.processWalletFunding({
    userId: params.userId,
    customerName: user.fullName as string,
    customerEmail: user.email as string,
    walletAccountNumber: wallet.accountNumber as string,
    amount,
    paymentChannel: params.paymentChannel,
  });

  return withTransaction(db, () => {
    const freshWallet = db
      .prepare("SELECT * FROM Wallet WHERE id = ?")
      .get(wallet.id as string) as Record<string, unknown>;
    const balanceBefore = Number(freshWallet.balance);
    const balanceAfter = balanceBefore + amount;
    const now = new Date().toISOString();
    const txId = `tx_${uniqueSuffix()}`;
    const txRef = `DBC-TX-WF-${uniqueSuffix()}`;

    db.prepare("UPDATE Wallet SET balance = ?, updatedAt = ? WHERE id = ?").run(
      balanceAfter,
      now,
      wallet.id as string
    );

    db.prepare(
      `INSERT INTO LedgerTransaction (
        id, walletId, reference, type, category, amount, balanceBefore, balanceAfter,
        description, gatewayProvider, gatewayReference, status, metadataJson, createdAt
      ) VALUES (?, ?, ?, 'CREDIT', 'WALLET_FUNDING', ?, ?, ?, ?, ?, ?, 'SUCCESS', ?, ?)`
    ).run(
      txId,
      wallet.id as string,
      txRef,
      amount,
      balanceBefore,
      balanceAfter,
      `Prepaid Wallet Funding via Flutterwave (${params.paymentChannel})`,
      gatewayRes.gatewayProvider,
      gatewayRes.gatewayReference,
      JSON.stringify(gatewayRes.rawPayload),
      now
    );

    return {
      txReference: txRef,
      gatewayReference: gatewayRes.gatewayReference,
      balanceBefore,
      balanceAfter,
      gatewayPayload: gatewayRes.rawPayload,
    };
  });
}

/**
 * 2. Super Admin: Create or Update Repayment Parameters
 */
export function upsertRepaymentParameter(params: {
  id?: string;
  name: string;
  code: string;
  category: "PERSONAL_LOAN" | "BUSINESS_FINANCE" | "SMART_CARD_CREDIT";
  interestRatePercent: number;
  repaymentFrequency: "WEEKLY" | "BIWEEKLY" | "MONTHLY";
  tenureCount: number;
  minAmount: number;
  maxAmount: number;
  gracePeriodDays: number;
  latePenaltyPercent: number;
  minWalletReservePercent: number;
  minCreditScore: number;
}) {
  const db = getDb();

  const name = (params.name || "").trim();
  const code = (params.code || "").trim().toUpperCase();
  if (!name || !code) {
    throw new Error("Repayment parameter name and code are required.");
  }

  const interestRatePercent = Number(params.interestRatePercent);
  const tenureCount = Math.floor(Number(params.tenureCount));
  const minAmount = Number(params.minAmount);
  const maxAmount = Number(params.maxAmount);
  const gracePeriodDays = Math.floor(Number(params.gracePeriodDays));
  const latePenaltyPercent = Number(params.latePenaltyPercent);
  const minWalletReservePercent = Number(params.minWalletReservePercent);
  const minCreditScore = Math.floor(Number(params.minCreditScore));

  if (interestRatePercent < 0 || interestRatePercent > 100) {
    throw new Error("Interest rate must be between 0% and 100%.");
  }
  if (tenureCount < 1 || tenureCount > 60) {
    throw new Error("Tenure count must be between 1 and 60 installments.");
  }
  if (minAmount <= 0 || maxAmount < minAmount) {
    throw new Error(
      "Minimum principal must be > 0 and Maximum principal must be >= Minimum principal."
    );
  }
  if (gracePeriodDays < 0 || latePenaltyPercent < 0) {
    throw new Error("Grace period and late penalty cannot be negative.");
  }
  if (minWalletReservePercent < 0 || minWalletReservePercent > 100) {
    throw new Error("Wallet reserve requirement must be between 0% and 100%.");
  }
  if (minCreditScore < 300 || minCreditScore > 850) {
    throw new Error("Minimum credit score must be between 300 and 850.");
  }

  const now = new Date().toISOString();

  if (params.id) {
    db.prepare(
      `UPDATE RepaymentParameter
       SET name = ?, code = ?, category = ?, interestRatePercent = ?,
           repaymentFrequency = ?, tenureCount = ?, minAmount = ?, maxAmount = ?,
           gracePeriodDays = ?, latePenaltyPercent = ?, minWalletReservePercent = ?,
           minCreditScore = ?, updatedAt = ?
       WHERE id = ?`
    ).run(
      name,
      code,
      params.category,
      interestRatePercent,
      params.repaymentFrequency,
      tenureCount,
      minAmount,
      maxAmount,
      gracePeriodDays,
      latePenaltyPercent,
      minWalletReservePercent,
      minCreditScore,
      now,
      params.id
    );
    return { id: params.id, updated: true };
  } else {
    const id = `prm_${uniqueSuffix()}`;
    db.prepare(
      `INSERT INTO RepaymentParameter (
        id, name, code, category, interestRatePercent, repaymentFrequency,
        tenureCount, minAmount, maxAmount, gracePeriodDays, latePenaltyPercent,
        minWalletReservePercent, minCreditScore, autoDisburseOnApproval, isActive, updatedBy, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 'Super Admin', ?, ?)`
    ).run(
      id,
      name,
      code,
      params.category,
      interestRatePercent,
      params.repaymentFrequency,
      tenureCount,
      minAmount,
      maxAmount,
      gracePeriodDays,
      latePenaltyPercent,
      minWalletReservePercent,
      minCreditScore,
      now,
      now
    );
    return { id, updated: false };
  }
}

/**
 * 3. Customer: Apply for Loan / Credit with Mandatory Wallet Standing Order Setup
 */
export function applyForLoanWithStandingOrder(params: {
  userId: string;
  repaymentParameterId: string;
  principalAmount: number;
  purpose: string;
  standingOrderAuthorized: boolean;
}) {
  const db = getDb();
  if (!params.standingOrderAuthorized) {
    throw new Error(
      "You must authorize a Wallet Standing Order matching the Super Admin repayment parameters before submitting a loan/credit application."
    );
  }

  const purpose = (params.purpose || "").trim();
  if (!purpose) {
    throw new Error("Please specify the purpose of the loan/credit facility.");
  }

  const user = db
    .prepare("SELECT * FROM User WHERE id = ?")
    .get(params.userId) as Record<string, unknown> | undefined;
  if (!user) throw new Error("Customer not found.");
  if (user.kycStatus !== "VERIFIED") {
    throw new Error(
      "Customer KYC must be VERIFIED before applying for a loan or credit line."
    );
  }

  const wallet = db
    .prepare("SELECT * FROM Wallet WHERE userId = ?")
    .get(params.userId) as Record<string, unknown> | undefined;
  if (!wallet) throw new Error("Customer wallet not found.");

  const param = db
    .prepare("SELECT * FROM RepaymentParameter WHERE id = ?")
    .get(params.repaymentParameterId) as Record<string, unknown> | undefined;
  if (!param) throw new Error("Selected Repayment Parameter not found.");
  if (!param.isActive) {
    throw new Error("Selected Repayment Parameter is no longer active.");
  }

  if (Number(user.creditScore) < Number(param.minCreditScore)) {
    throw new Error(
      `Customer credit score (${user.creditScore}) is below the Super Admin minimum requirement (${param.minCreditScore}) for '${param.name}'.`
    );
  }

  const principal = Math.round(Number(params.principalAmount));
  if (
    !Number.isFinite(principal) ||
    principal < Number(param.minAmount) ||
    principal > Number(param.maxAmount)
  ) {
    throw new Error(
      `Principal amount must be between ₦${Number(
        param.minAmount
      ).toLocaleString()} and ₦${Number(param.maxAmount).toLocaleString()} per Super Admin rules.`
    );
  }

  const tenureCount = Number(param.tenureCount);
  const ratePerCycle = Number(param.interestRatePercent) / 100;
  const totalInterest = Math.round(principal * ratePerCycle * tenureCount);
  const totalPayable = principal + totalInterest;

  // Base installment amount for first (tenureCount - 1) installments
  const basePrincipalPortion = Math.floor(principal / tenureCount);
  const baseInterestPortion = Math.floor(totalInterest / tenureCount);
  const installmentAmount = basePrincipalPortion + baseInterestPortion;

  // Check Super Admin minimum wallet reserve requirement against available (spendable) balance
  const minReserveRequired = Math.round(
    installmentAmount * (Number(param.minWalletReservePercent) / 100)
  );
  const availableBalance = Math.max(
    0,
    Number(wallet.balance) - Number(wallet.lockedBalance)
  );
  if (availableBalance < minReserveRequired) {
    throw new Error(
      `Super Admin parameter '${
        param.code
      }' requires at least ${param.minWalletReservePercent}% of one installment (₦${minReserveRequired.toLocaleString()}) in available (unlocked) wallet funds to activate the Standing Order. Available: ₦${availableBalance.toLocaleString()}.`
    );
  }

  return withTransaction(db, () => {
    const now = new Date();
    const nowIso = now.toISOString();
    const suffix = uniqueSuffix();
    const loanId = `ln_${suffix}`;
    const loanRef = `DBC-LN-2026-${suffix.slice(-6)}`;
    const soId = `so_${suffix}`;
    const mandateRef = `DBC-SO-MND-${suffix.slice(-6)}`;
    const frequency = param.repaymentFrequency as string;

    const computeDueDate = (step: number) => {
      const d = new Date(now);
      if (frequency === "WEEKLY") d.setDate(d.getDate() + step * 7);
      else if (frequency === "BIWEEKLY") d.setDate(d.getDate() + step * 14);
      else d.setMonth(d.getMonth() + step);
      return d.toISOString().slice(0, 10);
    };

    const firstDueDate = computeDueDate(1);

    db.prepare(
      `INSERT INTO LoanApplication (
        id, reference, userId, repaymentParameterId, purpose,
        principalAmount, interestAmount, totalPayable, amountPaid, remainingBalance,
        installmentAmount, tenureCount, frequency, status, adminNotes, disbursedAt, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, 'UNDER_REVIEW', ?, NULL, ?)`
    ).run(
      loanId,
      loanRef,
      params.userId,
      params.repaymentParameterId,
      purpose,
      principal,
      totalInterest,
      totalPayable,
      totalPayable,
      installmentAmount,
      tenureCount,
      frequency,
      `Standing Order Mandate ${mandateRef} verified against Super Admin rule ${param.code}. Awaiting disbursement to wallet ${wallet.accountNumber}.`,
      nowIso
    );

    db.prepare(
      `INSERT INTO StandingOrder (
        id, mandateReference, userId, walletId, repaymentParameterId, loanApplicationId,
        frequency, installmentAmount, reservedAmount, totalInstallments, completedInstallments,
        failedAttempts, nextExecutionDate, status, authorizedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, 'ACTIVE', ?)`
    ).run(
      soId,
      mandateRef,
      params.userId,
      wallet.id as string,
      params.repaymentParameterId,
      loanId,
      frequency,
      installmentAmount,
      minReserveRequired,
      tenureCount,
      firstDueDate,
      nowIso
    );

    // Lock the minimum wallet reserve for the standing order
    const newLockedBalance = Number(wallet.lockedBalance) + minReserveRequired;
    db.prepare(
      "UPDATE Wallet SET lockedBalance = ?, updatedAt = ? WHERE id = ?"
    ).run(newLockedBalance, nowIso, wallet.id as string);

    const insertSched = db.prepare(
      `INSERT INTO RepaymentSchedule (
        id, loanApplicationId, installmentNumber, dueDate,
        principalPortion, interestPortion, totalAmount, penaltyAmount, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'PENDING')`
    );

    // Final installment absorbs any rounding remainder so sum(totalAmount) === totalPayable
    for (let i = 1; i <= tenureCount; i++) {
      const isLast = i === tenureCount;
      const pPortion = isLast
        ? principal - basePrincipalPortion * (tenureCount - 1)
        : basePrincipalPortion;
      const iPortion = isLast
        ? totalInterest - baseInterestPortion * (tenureCount - 1)
        : baseInterestPortion;
      const instTotal = pPortion + iPortion;

      insertSched.run(
        `sch_${loanId}_${i}`,
        loanId,
        i,
        computeDueDate(i),
        pPortion,
        iPortion,
        instTotal
      );
    }

    return {
      loanId,
      loanReference: loanRef,
      mandateReference: mandateRef,
      installmentAmount,
      reservedAmount: minReserveRequired,
      totalPayable,
      firstDueDate,
    };
  });
}

/**
 * 4A. Super Admin: Approve Loan & Disburse Principal Directly into Customer Wallet
 */
export function approveAndDisburseLoanToWallet(params: {
  loanApplicationId: string;
  adminNotes?: string;
}) {
  const db = getDb();
  return withTransaction(db, () => {
    const loan = db
      .prepare("SELECT * FROM LoanApplication WHERE id = ?")
      .get(params.loanApplicationId) as Record<string, unknown> | undefined;
    if (!loan) throw new Error("Loan application not found.");

    if (loan.status === "APPROVED_DISBURSED" || loan.status === "REPAID") {
      throw new Error(
        "Loan has already been disbursed to the customer's wallet."
      );
    }
    if (loan.status === "REJECTED") {
      throw new Error("Cannot disburse a rejected loan application.");
    }

    const standingOrder = db
      .prepare("SELECT * FROM StandingOrder WHERE loanApplicationId = ?")
      .get(params.loanApplicationId) as Record<string, unknown> | undefined;
    if (!standingOrder || standingOrder.status !== "ACTIVE") {
      throw new Error(
        "Cannot disburse loan without an ACTIVE Wallet Standing Order mandate."
      );
    }

    const wallet = db
      .prepare("SELECT * FROM Wallet WHERE userId = ?")
      .get(loan.userId as string) as Record<string, unknown> | undefined;
    if (!wallet) throw new Error("Customer wallet not found.");

    const principal = Number(loan.principalAmount);
    const balanceBefore = Number(wallet.balance);
    const balanceAfter = balanceBefore + principal;
    const now = new Date().toISOString();
    const suffix = uniqueSuffix();
    const txRef = `DBC-TX-LD-${suffix}`;

    db.prepare(
      `UPDATE LoanApplication
       SET status = 'APPROVED_DISBURSED', disbursedAt = ?, adminNotes = ?
       WHERE id = ?`
    ).run(
      now,
      params.adminNotes ||
        `Approved by Super Admin. ₦${principal.toLocaleString()} disbursed to Wallet ${
          wallet.accountNumber
        }. Standing Order ${standingOrder.mandateReference} active.`,
      params.loanApplicationId
    );

    db.prepare("UPDATE Wallet SET balance = ?, updatedAt = ? WHERE id = ?").run(
      balanceAfter,
      now,
      wallet.id as string
    );

    db.prepare(
      `INSERT INTO LedgerTransaction (
        id, walletId, reference, type, category, amount, balanceBefore, balanceAfter,
        description, gatewayProvider, gatewayReference, status, metadataJson, createdAt
      ) VALUES (?, ?, ?, 'CREDIT', 'LOAN_DISBURSEMENT', ?, ?, ?, ?, 'INTERNAL_LEDGER', ?, 'SUCCESS', ?, ?)`
    ).run(
      `tx_${suffix}`,
      wallet.id as string,
      txRef,
      principal,
      balanceBefore,
      balanceAfter,
      `Loan & Credit Disbursement to Wallet (${loan.reference})`,
      loan.reference as string,
      JSON.stringify({
        loanId: loan.id,
        mandateReference: standingOrder.mandateReference,
      }),
      now
    );

    return {
      loanReference: loan.reference,
      disbursedAmount: principal,
      walletAccountNumber: wallet.accountNumber,
      newWalletBalance: balanceAfter,
      txReference: txRef,
    };
  });
}

/**
 * 4B. Super Admin: Reject Loan Application & Release Locked Standing Order Reserve
 */
export function rejectLoanApplication(params: {
  loanApplicationId: string;
  adminNotes?: string;
}) {
  const db = getDb();
  return withTransaction(db, () => {
    const loan = db
      .prepare("SELECT * FROM LoanApplication WHERE id = ?")
      .get(params.loanApplicationId) as Record<string, unknown> | undefined;
    if (!loan) throw new Error("Loan application not found.");
    if (loan.status !== "UNDER_REVIEW") {
      throw new Error("Only UNDER_REVIEW loan applications can be rejected.");
    }

    const standingOrder = db
      .prepare("SELECT * FROM StandingOrder WHERE loanApplicationId = ?")
      .get(params.loanApplicationId) as Record<string, unknown> | undefined;

    const wallet = db
      .prepare("SELECT * FROM Wallet WHERE userId = ?")
      .get(loan.userId as string) as Record<string, unknown> | undefined;

    const now = new Date().toISOString();

    db.prepare(
      `UPDATE LoanApplication
       SET status = 'REJECTED', remainingBalance = 0, adminNotes = ?
       WHERE id = ?`
    ).run(
      params.adminNotes ||
        "Application declined by Super Admin. Standing Order reserve unlocked.",
      params.loanApplicationId
    );

    if (standingOrder) {
      const reserved = Number(standingOrder.reservedAmount || 0);
      db.prepare(
        `UPDATE StandingOrder
         SET status = 'CANCELLED', reservedAmount = 0, nextExecutionDate = 'CANCELLED'
         WHERE id = ?`
      ).run(standingOrder.id as string);

      if (wallet && reserved > 0) {
        const updatedLocked = Math.max(
          0,
          Number(wallet.lockedBalance) - reserved
        );
        db.prepare(
          "UPDATE Wallet SET lockedBalance = ?, updatedAt = ? WHERE id = ?"
        ).run(updatedLocked, now, wallet.id as string);
      }
    }

    db.prepare(
      `UPDATE RepaymentSchedule
       SET status = 'CANCELLED'
       WHERE loanApplicationId = ? AND status = 'PENDING'`
    ).run(params.loanApplicationId);

    return {
      loanReference: loan.reference,
      status: "REJECTED",
    };
  });
}

/**
 * 5. Standing Order Execution Engine:
 * Deducts next due installment from the Customer's Prepaid Wallet based on Super Admin Repayment Parameters.
 */
export function executeStandingOrderDeduction(params: {
  standingOrderId: string;
  triggeredBy?: string;
}) {
  const db = getDb();
  return withTransaction(db, () => {
    const so = db
      .prepare(
        `SELECT so.*, p.latePenaltyPercent, p.code as parameterCode, p.name as parameterName
         FROM StandingOrder so
         JOIN RepaymentParameter p ON so.repaymentParameterId = p.id
         WHERE so.id = ?`
      )
      .get(params.standingOrderId) as Record<string, unknown> | undefined;

    if (!so) throw new Error("Standing Order not found.");
    if (so.status === "COMPLETED" || so.status === "CANCELLED") {
      throw new Error(
        `Standing Order is already ${so.status} and has no pending deductions.`
      );
    }

    const loan = db
      .prepare("SELECT * FROM LoanApplication WHERE id = ?")
      .get(so.loanApplicationId as string) as
      | Record<string, unknown>
      | undefined;
    if (!loan) throw new Error("Linked loan application not found.");
    if (loan.status !== "APPROVED_DISBURSED" && loan.status !== "OVERDUE") {
      throw new Error(
        `Loan (${loan.reference}) must be disbursed before Standing Order repayments can be deducted.`
      );
    }

    const nextSchedule = db
      .prepare(
        `SELECT * FROM RepaymentSchedule
         WHERE loanApplicationId = ? AND status != 'PAID' AND status != 'CANCELLED'
         ORDER BY installmentNumber ASC LIMIT 1`
      )
      .get(loan.id as string) as Record<string, unknown> | undefined;

    if (!nextSchedule) {
      throw new Error("No pending repayment installments remain.");
    }

    const wallet = db
      .prepare("SELECT * FROM Wallet WHERE id = ?")
      .get(so.walletId as string) as Record<string, unknown> | undefined;
    if (!wallet) throw new Error("Customer wallet not found.");

    const walletBalance = Number(wallet.balance);
    const amountDue =
      Number(nextSchedule.totalAmount) + Number(nextSchedule.penaltyAmount);
    const installmentNumber = Number(nextSchedule.installmentNumber);
    const totalInst = Number(so.totalInstallments);
    const isFinalInstallment = installmentNumber >= totalInst;

    // Protect other Standing Orders' locked reserves, while allowing this Standing Order's own reserve on its final installment
    const otherLockedBalance = isFinalInstallment
      ? Math.max(0, Number(wallet.lockedBalance) - Number(so.reservedAmount || 0))
      : Number(wallet.lockedBalance);
    const usableBalanceForThisSO = Math.max(0, walletBalance - otherLockedBalance);

    const now = new Date().toISOString();
    const suffix = uniqueSuffix();

    if (usableBalanceForThisSO < amountDue) {
      // Insufficient wallet balance -> Apply Super Admin late penalty parameter & flag overdue
      const penaltyRate = Number(so.latePenaltyPercent) / 100;
      const addedPenalty = Math.round(
        Number(nextSchedule.totalAmount) * penaltyRate
      );
      const newPenalty = Number(nextSchedule.penaltyAmount) + addedPenalty;

      db.prepare(
        `UPDATE RepaymentSchedule
         SET status = 'OVERDUE_INSUFFICIENT_FUNDS', penaltyAmount = ?
         WHERE id = ?`
      ).run(newPenalty, nextSchedule.id as string);

      db.prepare(
        `UPDATE StandingOrder
         SET failedAttempts = failedAttempts + 1
         WHERE id = ?`
      ).run(so.id as string);

      db.prepare(
        `UPDATE LoanApplication
         SET status = 'OVERDUE', remainingBalance = remainingBalance + ?
         WHERE id = ?`
      ).run(addedPenalty, loan.id as string);

      db.prepare(
        `INSERT INTO StandingOrderExecution (
          id, standingOrderId, installmentNumber, amountAttempted, walletBalanceAtRun,
          status, ledgerTxReference, notes, executedAt
        ) VALUES (?, ?, ?, ?, ?, 'INSUFFICIENT_FUNDS', NULL, ?, ?)`
      ).run(
        `soe_${suffix}`,
        so.id as string,
        installmentNumber,
        amountDue,
        walletBalance,
        `Insufficient usable wallet funds (Usable: ₦${usableBalanceForThisSO.toLocaleString()} < Due: ₦${amountDue.toLocaleString()}). Applied ${
          so.latePenaltyPercent
        }% Super Admin late penalty (+₦${addedPenalty.toLocaleString()}). Customer must fund wallet.`,
        now
      );

      return {
        outcome: "INSUFFICIENT_FUNDS" as const,
        installmentNumber,
        amountAttempted: amountDue,
        walletBalance,
        usableBalance: usableBalanceForThisSO,
        penaltyApplied: addedPenalty,
      };
    }

    // Sufficient wallet funds -> Deduct from Wallet & record Standing Order repayment!
    const balanceBefore = walletBalance;
    const balanceAfter = balanceBefore - amountDue;
    const txRef = `DBC-TX-SO-${suffix}`;

    const newCompleted = Number(so.completedInstallments) + 1;
    const soStatus = newCompleted >= totalInst ? "COMPLETED" : "ACTIVE";

    // If all installments are completed, release this Standing Order's locked reserve!
    const releasedReserve =
      soStatus === "COMPLETED" ? Number(so.reservedAmount || 0) : 0;
    const newLockedBalance = Math.max(
      0,
      Number(wallet.lockedBalance) - releasedReserve
    );

    db.prepare(
      "UPDATE Wallet SET balance = ?, lockedBalance = ?, updatedAt = ? WHERE id = ?"
    ).run(balanceAfter, newLockedBalance, now, wallet.id as string);

    db.prepare(
      `INSERT INTO LedgerTransaction (
        id, walletId, reference, type, category, amount, balanceBefore, balanceAfter,
        description, gatewayProvider, gatewayReference, status, metadataJson, createdAt
      ) VALUES (?, ?, ?, 'DEBIT', 'STANDING_ORDER_REPAYMENT', ?, ?, ?, ?, 'STANDING_ORDER_ENGINE', ?, 'SUCCESS', ?, ?)`
    ).run(
      `tx_${suffix}`,
      wallet.id as string,
      txRef,
      amountDue,
      balanceBefore,
      balanceAfter,
      `Standing Order Repayment #${installmentNumber}/${so.totalInstallments} — Mandate ${so.mandateReference} (${loan.reference})`,
      so.mandateReference as string,
      JSON.stringify({
        standingOrderId: so.id,
        loanReference: loan.reference,
        installmentNumber,
        reserveReleased: releasedReserve,
        triggeredBy: params.triggeredBy || "STANDING_ORDER_SCHEDULER",
      }),
      now
    );

    db.prepare(
      `UPDATE RepaymentSchedule
       SET status = 'PAID', paidAt = ?, txReference = ?
       WHERE id = ?`
    ).run(now, txRef, nextSchedule.id as string);

    // Find next pending schedule date if any
    const followingSchedule = db
      .prepare(
        `SELECT dueDate FROM RepaymentSchedule
         WHERE loanApplicationId = ? AND status != 'PAID' AND status != 'CANCELLED'
         ORDER BY installmentNumber ASC LIMIT 1`
      )
      .get(loan.id as string) as { dueDate: string } | undefined;

    db.prepare(
      `UPDATE StandingOrder
       SET completedInstallments = ?, status = ?, reservedAmount = ?, nextExecutionDate = ?
       WHERE id = ?`
    ).run(
      newCompleted,
      soStatus,
      soStatus === "COMPLETED" ? 0 : Number(so.reservedAmount || 0),
      followingSchedule ? followingSchedule.dueDate : "COMPLETED",
      so.id as string
    );

    const newAmountPaid = Number(loan.amountPaid) + amountDue;
    const newRemaining = Math.max(0, Number(loan.remainingBalance) - amountDue);
    const newLoanStatus =
      newRemaining <= 0 || soStatus === "COMPLETED"
        ? "REPAID"
        : "APPROVED_DISBURSED";

    db.prepare(
      `UPDATE LoanApplication
       SET amountPaid = ?, remainingBalance = ?, status = ?
       WHERE id = ?`
    ).run(newAmountPaid, newRemaining, newLoanStatus, loan.id as string);

    db.prepare(
      `INSERT INTO StandingOrderExecution (
        id, standingOrderId, installmentNumber, amountAttempted, walletBalanceAtRun,
        status, ledgerTxReference, notes, executedAt
      ) VALUES (?, ?, ?, ?, ?, 'SUCCESS', ?, ?, ?)`
    ).run(
      `soe_${suffix}`,
      so.id as string,
      installmentNumber,
      amountDue,
      walletBalance,
      txRef,
      `Successfully deducted ₦${amountDue.toLocaleString()} from Wallet ${
        wallet.accountNumber
      } per Super Admin parameter ${so.parameterCode}.${
        releasedReserve > 0
          ? ` Released ₦${releasedReserve.toLocaleString()} Standing Order reserve.`
          : ""
      }`,
      now
    );

    return {
      outcome: "SUCCESS" as const,
      txReference: txRef,
      installmentNumber,
      amountDeducted: amountDue,
      balanceBefore,
      balanceAfter,
      reserveReleased: releasedReserve,
      remainingLoanBalance: newRemaining,
      loanStatus: newLoanStatus,
    };
  });
}

/**
 * 5B. Super Admin: Run Batch Standing Order Cycle across all active disbursed loans
 */
export function runBatchStandingOrderCycle() {
  const db = getDb();
  const activeOrders = db
    .prepare(
      `SELECT so.id, so.mandateReference
       FROM StandingOrder so
       JOIN LoanApplication l ON so.loanApplicationId = l.id
       WHERE so.status = 'ACTIVE'
         AND (l.status = 'APPROVED_DISBURSED' OR l.status = 'OVERDUE')`
    )
    .all() as Array<{ id: string; mandateReference: string }>;

  let succeeded = 0;
  let insufficientFunds = 0;
  const results: Array<Record<string, unknown>> = [];

  for (const order of activeOrders) {
    const res = executeStandingOrderDeduction({
      standingOrderId: order.id,
      triggeredBy: "SUPER_ADMIN_BATCH_CYCLE",
    });
    if (res.outcome === "SUCCESS") succeeded++;
    else insufficientFunds++;
    results.push({ mandateReference: order.mandateReference, ...res });
  }

  return {
    processedCount: activeOrders.length,
    succeeded,
    insufficientFunds,
    results,
  };
}

/**
 * 6. Customer: Apply for Virtual or Physical Smart Card (Powered by Flutterwave Gateway)
 */
export async function applyForSmartCard(params: {
  userId: string;
  cardType: "VIRTUAL" | "PHYSICAL";
  cardBrand: "MASTERCARD" | "VERVE" | "VISA";
  cardTier: "GOLD_EXECUTIVE" | "PLATINUM_BUSINESS" | "CLASSIC_SMART";
  initialFundingAmount: number;
  creditLineLinked: boolean;
  deliveryAddress?: string;
}) {
  const db = getDb();
  const user = db
    .prepare("SELECT * FROM User WHERE id = ?")
    .get(params.userId) as Record<string, unknown> | undefined;
  if (!user) throw new Error("Customer not found.");

  const wallet = db
    .prepare("SELECT * FROM Wallet WHERE userId = ?")
    .get(params.userId) as Record<string, unknown> | undefined;
  if (!wallet) throw new Error("Customer wallet not found.");

  const issuanceFee = params.cardType === "PHYSICAL" ? 2500 : 1000;
  const initialFund = Math.round(Number(params.initialFundingAmount || 0));
  if (!Number.isFinite(initialFund) || initialFund < 0) {
    throw new Error("Initial card funding amount cannot be negative.");
  }

  if (
    params.cardType === "PHYSICAL" &&
    !(params.deliveryAddress || "").trim()
  ) {
    throw new Error(
      "A delivery address is required for Physical Smart Card orders."
    );
  }

  const spendingLimit =
    params.cardTier === "PLATINUM_BUSINESS"
      ? 10000000
      : params.cardTier === "GOLD_EXECUTIVE"
      ? 3000000
      : 1000000;

  if (initialFund > spendingLimit) {
    throw new Error(
      `Initial funding amount (₦${initialFund.toLocaleString()}) cannot exceed the card tier spending limit (₦${spendingLimit.toLocaleString()}).`
    );
  }

  const totalWalletDebit = issuanceFee + initialFund;
  const availableBalance = Math.max(
    0,
    Number(wallet.balance) - Number(wallet.lockedBalance)
  );

  if (availableBalance < totalWalletDebit) {
    throw new Error(
      `Insufficient available wallet balance (excluding locked Standing Order reserve). Issuing this ${
        params.cardType
      } card requires ₦${issuanceFee.toLocaleString()} issuance fee + ₦${initialFund.toLocaleString()} initial card load (Total: ₦${totalWalletDebit.toLocaleString()}, Available: ₦${availableBalance.toLocaleString()}). Please fund your wallet first.`
    );
  }

  const gatewayCard = await flutterwaveGateway.issueSmartCard({
    userId: params.userId,
    cardholderName:
      (user.businessName as string) || (user.fullName as string),
    customerEmail: user.email as string,
    cardType: params.cardType,
    cardBrand: params.cardBrand,
    cardTier: params.cardTier,
    initialFundingAmount: initialFund,
    spendingLimit,
    creditLineLinked: params.creditLineLinked,
    deliveryAddress: params.deliveryAddress,
  });

  return withTransaction(db, () => {
    const freshWallet = db
      .prepare("SELECT * FROM Wallet WHERE id = ?")
      .get(wallet.id as string) as Record<string, unknown>;
    const now = new Date().toISOString();
    const balanceBefore = Number(freshWallet.balance);
    const balanceAfterFee = balanceBefore - issuanceFee;
    const balanceAfterAll = balanceAfterFee - initialFund;

    db.prepare("UPDATE Wallet SET balance = ?, updatedAt = ? WHERE id = ?").run(
      balanceAfterAll,
      now,
      wallet.id as string
    );

    const feeSuffix = uniqueSuffix();
    const feeTxRef = `DBC-TX-CIF-${feeSuffix}`;
    db.prepare(
      `INSERT INTO LedgerTransaction (
        id, walletId, reference, type, category, amount, balanceBefore, balanceAfter,
        description, gatewayProvider, gatewayReference, status, metadataJson, createdAt
      ) VALUES (?, ?, ?, 'DEBIT', 'CARD_ISSUANCE_FEE', ?, ?, ?, ?, ?, ?, 'SUCCESS', ?, ?)`
    ).run(
      `tx_${feeSuffix}`,
      wallet.id as string,
      feeTxRef,
      issuanceFee,
      balanceBefore,
      balanceAfterFee,
      `Flutterwave ${params.cardType} ${params.cardBrand} Card Issuance Fee (${gatewayCard.maskedPan})`,
      gatewayCard.gatewayProvider,
      gatewayCard.flutterwaveCardId,
      JSON.stringify({ cardType: params.cardType, issuanceFee }),
      now
    );

    let loadTxRef = feeTxRef;
    if (initialFund > 0) {
      const loadSuffix = uniqueSuffix();
      loadTxRef = `DBC-TX-CRD-${loadSuffix}`;
      db.prepare(
        `INSERT INTO LedgerTransaction (
          id, walletId, reference, type, category, amount, balanceBefore, balanceAfter,
          description, gatewayProvider, gatewayReference, status, metadataJson, createdAt
        ) VALUES (?, ?, ?, 'DEBIT', 'CARD_FUNDING', ?, ?, ?, ?, ?, ?, 'SUCCESS', ?, ?)`
      ).run(
        `tx_${loadSuffix}`,
        wallet.id as string,
        loadTxRef,
        initialFund,
        balanceAfterFee,
        balanceAfterAll,
        `Flutterwave ${params.cardType} ${params.cardBrand} Initial Card Load (${gatewayCard.maskedPan})`,
        gatewayCard.gatewayProvider,
        gatewayCard.flutterwaveCardId,
        JSON.stringify(gatewayCard.rawPayload),
        now
      );
    }

    const cardId = `crd_${uniqueSuffix()}`;
    db.prepare(
      `INSERT INTO SmartCard (
        id, userId, cardType, cardBrand, cardTier, maskedPan, fullPanMock, cvvMock,
        expiryMonth, expiryYear, cardholderName, currency, cardBalance, spendingLimit,
        creditLineLinked, flutterwaveCardId, gatewayMode, deliveryAddress, deliveryStatus, status, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'NGN', ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      cardId,
      params.userId,
      params.cardType,
      params.cardBrand,
      params.cardTier,
      gatewayCard.maskedPan,
      gatewayCard.fullPan,
      gatewayCard.cvv,
      gatewayCard.expiryMonth,
      gatewayCard.expiryYear,
      ((user.businessName as string) || (user.fullName as string)).toUpperCase(),
      initialFund,
      spendingLimit,
      params.creditLineLinked ? 1 : 0,
      gatewayCard.flutterwaveCardId,
      gatewayCard.gatewayProvider,
      params.deliveryAddress || null,
      gatewayCard.deliveryStatus,
      gatewayCard.cardStatus,
      now
    );

    return {
      cardId,
      flutterwaveCardId: gatewayCard.flutterwaveCardId,
      maskedPan: gatewayCard.maskedPan,
      txReference: loadTxRef,
      newWalletBalance: balanceAfterAll,
    };
  });
}

/**
 * 7. Fund Existing Smart Card from Customer Wallet via Flutterwave Gateway
 */
export async function fundSmartCardFromWallet(params: {
  cardId: string;
  amount: number;
}) {
  const db = getDb();
  const card = db
    .prepare("SELECT * FROM SmartCard WHERE id = ?")
    .get(params.cardId) as Record<string, unknown> | undefined;
  if (!card) throw new Error("Smart Card not found.");
  if (card.status !== "ACTIVE") {
    throw new Error("Cannot fund a frozen or terminated Smart Card.");
  }

  const wallet = db
    .prepare("SELECT * FROM Wallet WHERE userId = ?")
    .get(card.userId as string) as Record<string, unknown> | undefined;
  if (!wallet) throw new Error("Customer wallet not found.");

  const amount = Math.round(Number(params.amount));
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Amount must be greater than 0 NGN.");
  }

  const availableBalance = Math.max(
    0,
    Number(wallet.balance) - Number(wallet.lockedBalance)
  );
  if (availableBalance < amount) {
    throw new Error(
      `Insufficient available wallet balance (Available: ₦${availableBalance.toLocaleString()}, Locked Standing Order Reserve: ₦${Number(
        wallet.lockedBalance
      ).toLocaleString()}).`
    );
  }

  const newCardBalance = Number(card.cardBalance) + amount;
  if (newCardBalance > Number(card.spendingLimit)) {
    throw new Error(
      `Funding ₦${amount.toLocaleString()} would exceed this card's spending limit of ₦${Number(
        card.spendingLimit
      ).toLocaleString()}.`
    );
  }

  const flwRes = await flutterwaveGateway.fundSmartCard({
    flutterwaveCardId: card.flutterwaveCardId as string,
    amount,
  });

  return withTransaction(db, () => {
    const freshWallet = db
      .prepare("SELECT * FROM Wallet WHERE id = ?")
      .get(wallet.id as string) as Record<string, unknown>;
    const now = new Date().toISOString();
    const balanceBefore = Number(freshWallet.balance);
    const balanceAfter = balanceBefore - amount;
    const suffix = uniqueSuffix();
    const txRef = `DBC-TX-CF-${suffix}`;

    db.prepare("UPDATE Wallet SET balance = ?, updatedAt = ? WHERE id = ?").run(
      balanceAfter,
      now,
      wallet.id as string
    );

    db.prepare("UPDATE SmartCard SET cardBalance = ? WHERE id = ?").run(
      newCardBalance,
      params.cardId
    );

    db.prepare(
      `INSERT INTO LedgerTransaction (
        id, walletId, reference, type, category, amount, balanceBefore, balanceAfter,
        description, gatewayProvider, gatewayReference, status, metadataJson, createdAt
      ) VALUES (?, ?, ?, 'DEBIT', 'CARD_FUNDING', ?, ?, ?, ?, ?, ?, 'SUCCESS', ?, ?)`
    ).run(
      `tx_${suffix}`,
      wallet.id as string,
      txRef,
      amount,
      balanceBefore,
      balanceAfter,
      `Wallet to Flutterwave Smart Card Transfer (${card.maskedPan})`,
      flwRes.gatewayProvider,
      flwRes.gatewayReference,
      JSON.stringify(flwRes.rawPayload),
      now
    );

    return {
      txReference: txRef,
      newWalletBalance: balanceAfter,
      newCardBalance,
    };
  });
}

/**
 * 8. Toggle Smart Card Status (Freeze / Unfreeze) or Update Physical Delivery Status
 */
export async function manageSmartCard(params: {
  cardId: string;
  action: "FREEZE" | "UNFREEZE" | "DISPATCH" | "DELIVER";
}) {
  const db = getDb();
  const card = db
    .prepare("SELECT * FROM SmartCard WHERE id = ?")
    .get(params.cardId) as Record<string, unknown> | undefined;
  if (!card) throw new Error("Smart Card not found.");

  if (params.action === "FREEZE" || params.action === "UNFREEZE") {
    const res = await flutterwaveGateway.updateCardStatus(
      card.flutterwaveCardId as string,
      params.action
    );
    db.prepare("UPDATE SmartCard SET status = ? WHERE id = ?").run(
      res.newStatus,
      params.cardId
    );
    return { cardId: params.cardId, status: res.newStatus };
  } else {
    if (card.cardType !== "PHYSICAL") {
      throw new Error("Only PHYSICAL Smart Cards have courier delivery states.");
    }
    const deliveryStatus =
      params.action === "DISPATCH" ? "DISPATCHED" : "DELIVERED";
    db.prepare("UPDATE SmartCard SET deliveryStatus = ? WHERE id = ?").run(
      deliveryStatus,
      params.cardId
    );
    return { cardId: params.cardId, deliveryStatus };
  }
}
