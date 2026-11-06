# DB Capital Smart Financial Platform

**Your Money. Your Credit. Your Growth.**  
*Build Once. Integrate Later. Deliver Excellence.*

## Overview
A unified financial management platform combining **Customer Prepaid Wallets**, **Loan & Credit Applications (Disbursed to Wallet)**, **Automated Wallet Standing Orders (Governed by Super Admin Repayment Parameters)**, and **Virtual & Physical Smart Cards powered by the Flutterwave Gateway**.

## Core Workflows Implemented
1. **Prepaid Customer Wallet (`WALLET_FUNDING`)**:
   - Every customer has a dedicated NGN wallet (`DB Capital / Flutterwave Wema Virtual`).
   - Customers fund their wallet via the Flutterwave Gateway adapter (Bank Transfer, Card, or USSD).
2. **Super Admin Repayment Parameters (`RepaymentParameter`)**:
   - In the **Super Admin Back Office**, the Super Admin configures loan and credit product parameters:
     - Interest rate (% per cycle), repayment frequency (`WEEKLY`, `BIWEEKLY`, `MONTHLY`), number of installments, minimum/maximum principal, grace period (days), late penalty fee (%), and minimum wallet reserve buffer (%).
3. **Loan & Credit Application + Mandatory Wallet Standing Order (`LoanApplication` & `StandingOrder`)**:
   - Customers select a credit/loan product in the Customer Portal.
   - The system computes the exact installment schedule based on the Super Admin's repayment parameters and requires the customer to authorize a **Wallet Standing Order Mandate** (`DBC-SO-MND-...`).
   - When the Super Admin approves the facility in the Back Office, the **loan principal is disbursed directly into the customer's Prepaid Wallet** (`LOAN_DISBURSEMENT`).
4. **Automated Standing Order Repayment Engine (`executeStandingOrderDeduction`)**:
   - On scheduled repayment dates (or when triggered manually for testing in the Portal or Back Office), the Standing Order engine deducts the installment amount directly from the customer's Prepaid Wallet (`STANDING_ORDER_REPAYMENT`).
   - If the customer's wallet balance is insufficient, the engine records an `INSUFFICIENT_FUNDS` execution attempt and applies the Super Admin's configured late penalty fee until the wallet is funded.
5. **Virtual & Physical Smart Cards (`SmartCard` via Flutterwave Gateway)**:
   - Customers apply for instant **Virtual** or courier-dispatched **Physical** cards (`Mastercard`, `Verve`, `Visa`).
   - Card issuance fees and top-ups are debited from the customer's Prepaid Wallet and provisioned through `FlutterwaveGatewayAdapter` (`src/lib/gateway/flutterwave-adapter.ts`).

## Running Locally
```bash
cd db-capital
npm run dev
```
Open `http://localhost:3005` in your browser.
