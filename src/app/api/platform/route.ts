import { NextRequest, NextResponse } from "next/server";
import {
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
} from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "usr_adaeze";
    const snapshot = getPlatformSnapshot(userId);
    return NextResponse.json({ ok: true, data: snapshot });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to load platform state";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload, currentUserId } = body;

    let result: unknown;

    switch (action) {
      case "FUND_WALLET":
        result = await fundCustomerWallet(payload);
        break;
      case "UPSERT_REPAYMENT_PARAMETER":
        result = upsertRepaymentParameter(payload);
        break;
      case "APPLY_LOAN_WITH_STANDING_ORDER":
        result = applyForLoanWithStandingOrder(payload);
        break;
      case "APPROVE_AND_DISBURSE_LOAN":
        result = approveAndDisburseLoanToWallet(payload);
        break;
      case "REJECT_LOAN":
        result = rejectLoanApplication(payload);
        break;
      case "EXECUTE_STANDING_ORDER":
        result = executeStandingOrderDeduction(payload);
        break;
      case "RUN_BATCH_STANDING_ORDERS":
        result = runBatchStandingOrderCycle();
        break;
      case "ISSUE_SMART_CARD":
        result = await applyForSmartCard(payload);
        break;
      case "FUND_SMART_CARD":
        result = await fundSmartCardFromWallet(payload);
        break;
      case "MANAGE_SMART_CARD":
        result = await manageSmartCard(payload);
        break;
      default:
        return NextResponse.json(
          { ok: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    const snapshot = getPlatformSnapshot(
      currentUserId || payload?.userId || "usr_adaeze"
    );
    return NextResponse.json({ ok: true, result, data: snapshot });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Operation failed unexpectedly";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
