import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { confirmAndCreditWalletPayment } from "@/lib/db";

/**
 * Unified Live Payment Webhook Receiver for Paystack & Flutterwave
 *
 * - Paystack sends `x-paystack-signature` (HMAC SHA-512 of raw request body using PAYSTACK_WEBHOOK_SECRET or PAYSTACK_SECRET_KEY)
 * - Flutterwave sends `verif-hash` (matches FLUTTERWAVE_WEBHOOK_SECRET or PAYMENT_WEBHOOK_SECRET)
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody || "{}") as Record<string, any>;

    const paystackSignature = req.headers.get("x-paystack-signature");
    const flutterwaveHash = req.headers.get("verif-hash");

    // 1. Handle Paystack Webhook (`charge.success`)
    if (paystackSignature || String(body.event || "").startsWith("charge.")) {
      const secret =
        process.env.PAYSTACK_WEBHOOK_SECRET ||
        process.env.PAYSTACK_SECRET_KEY ||
        "";
      if (
        secret &&
        !secret.toLowerCase().includes("mock") &&
        paystackSignature
      ) {
        const expectedSig = crypto
          .createHmac("sha512", secret)
          .update(rawBody)
          .digest("hex");
        if (expectedSig !== paystackSignature) {
          return NextResponse.json(
            { ok: false, error: "Invalid Paystack webhook signature" },
            { status: 401 }
          );
        }
      }

      if (body.event === "charge.success" && body.data?.status === "success") {
        const data = body.data;
        const amountNgn = Number(data.amount || 0) / 100;
        const meta = data.metadata || {};
        const settled = confirmAndCreditWalletPayment({
          gatewayReference: String(data.reference),
          gatewayProvider: "PAYSTACK_LIVE",
          amount: amountNgn,
          channel: String(
            meta.paymentChannel || data.channel || "BANK_TRANSFER"
          ).toUpperCase(),
          userId: meta.userId ? String(meta.userId) : undefined,
          walletAccountNumber: meta.walletAccountNumber
            ? String(meta.walletAccountNumber)
            : undefined,
          customerEmail: data.customer?.email
            ? String(data.customer.email)
            : undefined,
          rawPayload: body,
        });

        return NextResponse.json({ ok: true, provider: "PAYSTACK", settled });
      }

      return NextResponse.json({
        ok: true,
        ignored: true,
        event: body.event,
      });
    }

    // 2. Handle Flutterwave Webhook (`charge.completed`)
    const flwWebhookSecret =
      process.env.FLUTTERWAVE_WEBHOOK_SECRET ||
      process.env.PAYMENT_WEBHOOK_SECRET ||
      "";
    if (
      flwWebhookSecret &&
      !flwWebhookSecret.toLowerCase().includes("mock") &&
      flutterwaveHash &&
      flutterwaveHash !== flwWebhookSecret
    ) {
      return NextResponse.json(
        { ok: false, error: "Invalid Flutterwave webhook verif-hash" },
        { status: 401 }
      );
    }

    const flwData = body.data || body;
    if (
      (body.event === "charge.completed" ||
        body.event === "wallet.funding.completed") &&
      flwData?.status === "successful"
    ) {
      const meta = flwData.meta || body.meta_data || {};
      const settled = confirmAndCreditWalletPayment({
        gatewayReference: String(flwData.tx_ref || flwData.reference),
        gatewayProvider: "FLUTTERWAVE_LIVE",
        amount: Number(flwData.amount_settled || flwData.amount || 0),
        channel: String(
          meta.paymentChannel || flwData.payment_type || "BANK_TRANSFER"
        ).toUpperCase(),
        userId: meta.userId ? String(meta.userId) : undefined,
        walletAccountNumber: meta.walletAccountNumber
          ? String(meta.walletAccountNumber)
          : undefined,
        customerEmail: flwData.customer?.email
          ? String(flwData.customer.email)
          : undefined,
        rawPayload: body,
      });

      return NextResponse.json({ ok: true, provider: "FLUTTERWAVE", settled });
    }

    return NextResponse.json({
      ok: true,
      ignored: true,
      event: body.event || "unknown",
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Webhook processing failed";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
