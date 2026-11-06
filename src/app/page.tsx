"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Wallet,
  CreditCard,
  Building2,
  Coins,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Settings,
  Repeat,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Plus,
  Send,
  Layers,
  Server,
  Smartphone,
  Monitor,
  Globe,
  FileCheck2,
  Clock,
  Truck,
  BadgeCheck,
} from "lucide-react";

type PlatformMode = "WEBSITE" | "CUSTOMER_PORTAL" | "BACK_OFFICE";
type PortalTab =
  | "OVERVIEW"
  | "LOANS_AND_CREDIT"
  | "STANDING_ORDERS"
  | "SMART_CARDS"
  | "LEDGER";
type AdminTab =
  | "REPAYMENT_PARAMS"
  | "LOAN_DISBURSEMENTS"
  | "STANDING_ORDER_ENGINE"
  | "CARD_OPERATIONS"
  | "SYSTEM_LEDGER";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function DBCapitalPlatformPage() {
  const [platformMode, setPlatformMode] =
    useState<PlatformMode>("CUSTOMER_PORTAL");
  const [portalTab, setPortalTab] = useState<PortalTab>("OVERVIEW");
  const [adminTab, setAdminTab] = useState<AdminTab>("REPAYMENT_PARAMS");

  const [selectedUserId, setSelectedUserId] = useState<string>("usr_adaeze");
  const [snapshot, setSnapshot] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [banner, setBanner] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // Customer Wallet Funding Form State
  const [fundAmount, setFundAmount] = useState<string>("150000");
  const [fundChannel, setFundChannel] = useState<
    "BANK_TRANSFER" | "CARD" | "USSD"
  >("BANK_TRANSFER");
  const [showFundModal, setShowFundModal] = useState<boolean>(false);

  // Customer Loan + Standing Order Form State
  const [selectedParamId, setSelectedParamId] = useState<string>(
    "prm_personal_flexi"
  );
  const [loanPrincipal, setLoanPrincipal] = useState<string>("250000");
  const [loanPurpose, setLoanPurpose] = useState<string>(
    "Business working capital & equipment expansion"
  );
  const [standingOrderAccepted, setStandingOrderAccepted] =
    useState<boolean>(true);

  // Customer Smart Card Issuance Form State
  const [cardType, setCardType] = useState<"VIRTUAL" | "PHYSICAL">("VIRTUAL");
  const [cardBrand, setCardBrand] = useState<"MASTERCARD" | "VERVE" | "VISA">(
    "MASTERCARD"
  );
  const [cardTier, setCardTier] = useState<
    "GOLD_EXECUTIVE" | "PLATINUM_BUSINESS" | "CLASSIC_SMART"
  >("GOLD_EXECUTIVE");
  const [cardInitialFund, setCardInitialFund] = useState<string>("25000");
  const [cardDeliveryAddress, setCardDeliveryAddress] = useState<string>(
    "Plot 14 Admiralty Way, Lekki Phase 1, Lagos"
  );
  const [cardCreditLinked, setCardCreditLinked] = useState<boolean>(true);
  const [revealedCards, setRevealedCards] = useState<Record<string, boolean>>(
    {}
  );
  const [cardTopUpAmount, setCardTopUpAmount] = useState<
    Record<string, string>
  >({});

  // Super Admin Repayment Parameter Form State
  const [editingParamId, setEditingParamId] = useState<string | null>(null);
  const [paramName, setParamName] = useState<string>(
    "Executive Salary Advance Credit"
  );
  const [paramCode, setParamCode] = useState<string>("DBC-PL-EXEC");
  const [paramCategory, setParamCategory] = useState<
    "PERSONAL_LOAN" | "BUSINESS_FINANCE" | "SMART_CARD_CREDIT"
  >("PERSONAL_LOAN");
  const [paramRate, setParamRate] = useState<string>("2.8");
  const [paramFreq, setParamFreq] = useState<"WEEKLY" | "BIWEEKLY" | "MONTHLY">(
    "MONTHLY"
  );
  const [paramTenure, setParamTenure] = useState<string>("4");
  const [paramMinAmt, setParamMinAmt] = useState<string>("100000");
  const [paramMaxAmt, setParamMaxAmt] = useState<string>("5000000");
  const [paramGrace, setParamGrace] = useState<string>("3");
  const [paramPenalty, setParamPenalty] = useState<string>("1.5");
  const [paramReserve, setParamReserve] = useState<string>("10");
  const [paramMinScore, setParamMinScore] = useState<string>("640");

  const fetchSnapshot = useCallback(async (uid: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/platform?userId=${uid}`);
      const json = await res.json();
      if (json.ok) {
        setSnapshot(json.data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSnapshot(selectedUserId);
  }, [selectedUserId, fetchSnapshot]);

  async function runPlatformAction(
    action: string,
    payload: Record<string, unknown>,
    successMessage: string
  ) {
    setBusyAction(action);
    setBanner(null);
    try {
      const res = await fetch("/api/platform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          payload,
          currentUserId: selectedUserId,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        setBanner({ type: "error", text: json.error || "Action failed" });
        return null;
      }
      setSnapshot(json.data);
      if (json.result && json.result.outcome === "INSUFFICIENT_FUNDS") {
        setBanner({
          type: "error",
          text: `Standing Order attempt recorded INSUFFICIENT_FUNDS: Usable wallet balance (${formatNgn(
            json.result.usableBalance
          )}) is less than due installment (${formatNgn(
            json.result.amountAttempted
          )}). Applied Super Admin late penalty (+${formatNgn(
            json.result.penaltyApplied
          )}). Customer must fund wallet.`,
        });
      } else {
        setBanner({ type: "success", text: successMessage });
      }
      return json.result;
    } catch (e: unknown) {
      setBanner({
        type: "error",
        text: e instanceof Error ? e.message : "Network error",
      });
      return null;
    } finally {
      setBusyAction(null);
    }
  }

  const formatNgn = (val: number | string | undefined) =>
    `₦${Number(val || 0).toLocaleString("en-NG", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;

  if (loading && !snapshot) {
    return (
      <div className="min-h-screen bg-dbc-navy-gradient flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-dbc-gold-gradient flex items-center justify-center text-navy-950 font-black text-2xl shadow-lg">
            DB
          </div>
          <p className="text-gold-300 font-medium tracking-wide animate-pulse">
            Loading DB Capital Smart Financial Platform...
          </p>
        </div>
      </div>
    );
  }

  const currentUser = snapshot?.currentUser;
  const wallet = snapshot?.wallet;
  const repaymentParameters: any[] = snapshot?.repaymentParameters || [];
  const selectedParam =
    repaymentParameters.find((p) => p.id === selectedParamId) ||
    repaymentParameters[0];

  // Live Loan & Standing Order Preview calculation (matching backend integer math)
  const previewPrincipal = Math.round(Number(loanPrincipal || 0));
  const previewTenure = Math.max(1, Number(selectedParam?.tenureCount || 1));
  const previewRate = Number(selectedParam?.interestRatePercent || 0) / 100;
  const previewTotalInterest = Math.round(
    previewPrincipal * previewRate * previewTenure
  );
  const previewTotalPayable = previewPrincipal + previewTotalInterest;
  const previewInstallment =
    Math.floor(previewPrincipal / previewTenure) +
    Math.floor(previewTotalInterest / previewTenure);
  const previewMinWalletReserve = Math.round(
    previewInstallment *
      (Number(selectedParam?.minWalletReservePercent || 10) / 100)
  );

  const loadParamIntoEditor = (p: any) => {
    setEditingParamId(p.id);
    setParamName(p.name);
    setParamCode(p.code);
    setParamCategory(p.category);
    setParamRate(String(p.interestRatePercent));
    setParamFreq(p.repaymentFrequency);
    setParamTenure(String(p.tenureCount));
    setParamMinAmt(String(p.minAmount));
    setParamMaxAmt(String(p.maxAmount));
    setParamGrace(String(p.gracePeriodDays));
    setParamPenalty(String(p.latePenaltyPercent));
    setParamReserve(String(p.minWalletReservePercent));
    setParamMinScore(String(p.minCreditScore));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Executive Navigation Header */}
      <header className="bg-dbc-navy-gradient text-white border-b border-gold-500/30 sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-dbc-gold-gradient flex items-center justify-center text-navy-950 font-black text-xl shadow-md border border-white/20">
              DB
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white">
                  DB CAPITAL
                </span>
                <span className="text-[11px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-300 border border-gold-400/30 font-semibold">
                  Credit & Loan
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Your Money. Your Credit. Your Growth. •{" "}
                <span className="text-gold-400 font-medium">
                  Flutterwave Pre-Integration Ready
                </span>
              </p>
            </div>
          </div>

          {/* Three Platform Switcher (Website | Customer Portal | Super Admin Back Office) */}
          <div className="flex items-center bg-navy-950/70 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setPlatformMode("WEBSITE")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                platformMode === "WEBSITE"
                  ? "bg-dbc-gold-gradient text-navy-950 shadow"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              1. Website & Blueprint
            </button>
            <button
              onClick={() => setPlatformMode("CUSTOMER_PORTAL")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                platformMode === "CUSTOMER_PORTAL"
                  ? "bg-dbc-gold-gradient text-navy-950 shadow"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              2. Customer Wallet & App
            </button>
            <button
              onClick={() => setPlatformMode("BACK_OFFICE")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                platformMode === "BACK_OFFICE"
                  ? "bg-dbc-gold-gradient text-navy-950 shadow"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              3. Super Admin Back Office
            </button>
          </div>

          {/* Active Customer Persona Selector & Quick Wallet Pill */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/15">
              <span className="text-[11px] text-gold-300 uppercase font-semibold">
                Customer:
              </span>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
              >
                {(snapshot?.users || [])
                  .filter((u: any) => u.role === "CUSTOMER")
                  .map((u: any) => (
                    <option
                      key={u.id}
                      value={u.id}
                      className="bg-navy-900 text-white"
                    >
                      {u.fullName} ({u.accountType})
                    </option>
                  ))}
              </select>
            </div>
            <div className="hidden md:flex flex-col items-end bg-gold-500/15 border border-gold-400/30 px-3 py-1 rounded-lg">
              <span className="text-[10px] uppercase tracking-wider text-gold-300">
                Prepaid Wallet Balance
              </span>
              <span className="text-sm font-extrabold text-white">
                {formatNgn(wallet?.balance)}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Global Notification Banner */}
      {banner && (
        <div
          className={`border-b px-4 py-3 ${
            banner.type === "success"
              ? "bg-emerald-950 text-emerald-200 border-emerald-700"
              : banner.type === "error"
              ? "bg-rose-950 text-rose-200 border-rose-700"
              : "bg-navy-900 text-gold-300 border-gold-500/40"
          }`}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-sm font-medium">
              {banner.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{banner.text}</span>
            </div>
            <button
              onClick={() => setBanner(null)}
              className="text-xs underline opacity-75 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 1: EXECUTIVE WEBSITE & SYSTEM ARCHITECTURE                       */}
      {/* ===================================================================== */}
      {platformMode === "WEBSITE" && (
        <main className="flex-1">
          {/* Hero Section */}
          <section className="bg-dbc-navy-gradient text-white py-12 px-4 sm:px-6 border-b-4 border-gold-500">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 border border-gold-400/40 text-gold-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Build Once. Integrate Later. Deliver Excellence.
                </div>
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                  DB CAPITAL SMART{" "}
                  <span className="text-gold-400">FINANCIAL PLATFORM</span>
                </h1>
                <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
                  A unified digital financial platform with one smart card,
                  prepaid wallets, personal loans, and business finance. Fund
                  your wallet, apply for credit disbursed straight to your
                  wallet, and automate repayments via Standing Orders governed
                  by transparent parameters.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() => {
                      setPlatformMode("CUSTOMER_PORTAL");
                      setPortalTab("OVERVIEW");
                    }}
                    className="px-5 py-3 rounded-xl bg-dbc-gold-gradient text-navy-950 font-bold text-sm shadow-lg hover:opacity-95 transition flex items-center gap-2"
                  >
                    Open Customer Wallet & Portal
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setPlatformMode("CUSTOMER_PORTAL");
                      setPortalTab("LOANS_AND_CREDIT");
                    }}
                    className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-sm transition"
                  >
                    Apply for Loan & Standing Order
                  </button>
                  <button
                    onClick={() => setPlatformMode("BACK_OFFICE")}
                    className="px-5 py-3 rounded-xl bg-navy-800 hover:bg-navy-700 border border-gold-500/40 text-gold-300 font-semibold text-sm transition"
                  >
                    Super Admin Back Office
                  </button>
                </div>
              </div>

              {/* Interactive Card Visual in Hero */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl bg-gradient-to-br from-navy-900 via-navy-950 to-black p-6 border-2 border-gold-500/60 shadow-2xl relative overflow-hidden">
                  <div className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-gold-500/15 blur-2xl pointer-events-none" />
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gold-400 font-bold">
                        DB CAPITAL SMART CARD
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Powered by Flutterwave Gateway
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-dbc-gold-gradient flex items-center justify-center text-navy-950 font-black">
                      DB
                    </div>
                  </div>
                  <div className="w-12 h-9 rounded-md bg-gradient-to-br from-gold-300 to-gold-600 mb-5 border border-white/30" />
                  <p className="font-mono text-xl sm:text-2xl tracking-widest text-gold-300 font-bold mb-4">
                    5399 •••• •••• 8492
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-300 border-t border-white/10 pt-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block">
                        CARDHOLDER
                      </span>
                      <span className="font-bold text-white">
                        {currentUser?.fullName?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">
                        FORM FACTOR
                      </span>
                      <span className="font-bold text-gold-400">
                        VIRTUAL & PHYSICAL
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">
                        VALID THRU
                      </span>
                      <span className="font-bold text-white">08/29</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Core Products & System Architecture Grid matching the Infographic */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
            {/* 4 Core Pillars */}
            <div>
              <h2 className="text-xl font-extrabold text-navy-900 mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-gold-600" />
                Core Products & End-to-End Financial Flows
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-gold-500 transition flex flex-col justify-between">
                  <div>
                    <div className="w-11 h-11 rounded-xl bg-navy-900 text-gold-400 flex items-center justify-center mb-4">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-navy-900 text-base">
                      1. Prepaid Wallets
                    </h3>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      Customers prepay and fund their dedicated wallet via the
                      Flutterwave Gateway. Serves as the central hub for loan
                      disbursements, standing order repayments, and card loads.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setPlatformMode("CUSTOMER_PORTAL");
                      setPortalTab("OVERVIEW");
                      setShowFundModal(true);
                    }}
                    className="mt-4 text-xs font-bold text-navy-800 hover:text-gold-600 flex items-center gap-1"
                  >
                    Fund Wallet Now <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-gold-500 transition flex flex-col justify-between">
                  <div>
                    <div className="w-11 h-11 rounded-xl bg-navy-900 text-gold-400 flex items-center justify-center mb-4">
                      <Coins className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-navy-900 text-base">
                      2. Personal Loans & Credit
                    </h3>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      Flexible access to personal credit. Approved loans are{" "}
                      <strong>disbursed directly into the customer&apos;s wallet</strong>{" "}
                      and repaid automatically via their Wallet Standing Order.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setPlatformMode("CUSTOMER_PORTAL");
                      setPortalTab("LOANS_AND_CREDIT");
                    }}
                    className="mt-4 text-xs font-bold text-navy-800 hover:text-gold-600 flex items-center gap-1"
                  >
                    Apply via Wallet <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-gold-500 transition flex flex-col justify-between">
                  <div>
                    <div className="w-11 h-11 rounded-xl bg-navy-900 text-gold-400 flex items-center justify-center mb-4">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-navy-900 text-base">
                      3. Business Finance & Standing Orders
                    </h3>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      SME working capital governed by Super Admin repayment
                      parameters (interest, tenure, frequency, reserve buffer,
                      and automated standing order deductions).
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setPlatformMode("BACK_OFFICE");
                      setAdminTab("REPAYMENT_PARAMS");
                    }}
                    className="mt-4 text-xs font-bold text-navy-800 hover:text-gold-600 flex items-center gap-1"
                  >
                    Configure Admin Parameters{" "}
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-gold-500 transition flex flex-col justify-between">
                  <div>
                    <div className="w-11 h-11 rounded-xl bg-navy-900 text-gold-400 flex items-center justify-center mb-4">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-navy-900 text-base">
                      4. Smart Card (Virtual & Physical)
                    </h3>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      One card, multiple services. Issue instant Virtual or
                      Physical cards powered by the Flutterwave Gateway, funded
                      directly from the customer&apos;s wallet.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setPlatformMode("CUSTOMER_PORTAL");
                      setPortalTab("SMART_CARDS");
                    }}
                    className="mt-4 text-xs font-bold text-navy-800 hover:text-gold-600 flex items-center gap-1"
                  >
                    Manage Smart Cards <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive System Architecture Blueprint (Direct from the Infographic) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gold-600">
                    System Architecture Blueprint
                  </span>
                  <h3 className="text-lg font-extrabold text-navy-900">
                    Modular Shared Backend & Pre-Integration Flutterwave Gateway
                  </h3>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                  Gateway Mode: {snapshot?.gatewayStatus?.provider}
                </span>
              </div>

              <div className="space-y-4">
                {/* Tier 1: Frontends */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-navy-900 text-white border border-gold-500/30">
                    <p className="text-xs text-gold-400 font-bold uppercase">
                      Website (Responsive)
                    </p>
                    <p className="text-sm font-semibold mt-0.5">
                      Apply • Manage • Grow
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-navy-900 text-white border border-gold-500/30">
                    <p className="text-xs text-gold-400 font-bold uppercase">
                      Customer Wallet & Mobile App
                    </p>
                    <p className="text-sm font-semibold mt-0.5">
                      Bank • Borrow • Track Standing Orders
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-navy-900 text-white border border-gold-500/30">
                    <p className="text-xs text-gold-400 font-bold uppercase">
                      Back Office (Super Admin Portal)
                    </p>
                    <p className="text-sm font-semibold mt-0.5">
                      Repayment Parameters • Disburse • Monitor
                    </p>
                  </div>
                </div>

                {/* Tier 2: Shared Backend Services */}
                <div className="p-4 rounded-xl bg-slate-100 border border-slate-200">
                  <p className="text-xs font-bold uppercase tracking-wider text-navy-900 mb-3 text-center">
                    Shared Backend Services (Active Domain Engines)
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                    {[
                      "Customer & KYC Management",
                      "Wallet & Double-Entry Ledger",
                      "Super Admin Credit Engine",
                      "Loan & Standing Order Engine",
                      "Smart Card Management",
                      "Reporting & Analytics",
                    ].map((svc) => (
                      <div
                        key={svc}
                        className="bg-white p-2.5 rounded-lg border border-slate-200 text-center text-xs font-semibold text-navy-900 shadow-sm"
                      >
                        {svc}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tier 3: Integration Gateway */}
                <div className="p-4 rounded-xl bg-dbc-navy-gradient text-white border border-gold-500/40">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-gold-400">
                      Integration Gateway (Mock Now, Flutterwave Later)
                    </span>
                    <span className="text-[11px] font-mono text-slate-300">
                      src/lib/gateway/flutterwave-adapter.ts
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="bg-white/10 p-2.5 rounded-lg border border-white/15">
                      <span className="font-bold text-gold-300 block">
                        Payment Partner
                      </span>
                      Flutterwave Wallet Funding & Virtual/Physical Cards
                    </div>
                    <div className="bg-white/10 p-2.5 rounded-lg border border-white/15">
                      <span className="font-bold text-gold-300 block">
                        Issuing Bank
                      </span>
                      Wema Virtual NUBAN & Card BIN Sponsorship
                    </div>
                    <div className="bg-white/10 p-2.5 rounded-lg border border-white/15">
                      <span className="font-bold text-gold-300 block">
                        Credit Bureaus
                      </span>
                      CRC / FirstCentral Automated Scoring
                    </div>
                    <div className="bg-white/10 p-2.5 rounded-lg border border-white/15">
                      <span className="font-bold text-gold-300 block">
                        Identity Providers
                      </span>
                      BVN / NIN / CAC RC Verification
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* ===================================================================== */}
      {/* VIEW 2: CUSTOMER WALLET, LOANS, STANDING ORDERS & SMART CARDS PORTAL  */}
      {/* ===================================================================== */}
      {platformMode === "CUSTOMER_PORTAL" && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Customer Profile & Sub-navigation */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-navy-900 text-gold-400 font-black text-lg flex items-center justify-center">
                {currentUser?.fullName?.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-extrabold text-navy-900 text-lg">
                    {currentUser?.fullName}
                  </h2>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <BadgeCheck className="w-3.5 h-3.5" /> KYC Tier{" "}
                    {currentUser?.kycTier} ({currentUser?.kycStatus})
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {currentUser?.accountType}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Wallet Account:{" "}
                  <strong className="text-navy-900 font-mono">
                    {wallet?.accountNumber}
                  </strong>{" "}
                  ({wallet?.bankName}) • Credit Score:{" "}
                  <strong className="text-emerald-700">
                    {currentUser?.creditScore}/850
                  </strong>
                </p>
              </div>
            </div>

            {/* Sub-Tabs */}
            <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-xl">
              {[
                { id: "OVERVIEW", label: "Wallet Overview", icon: Wallet },
                {
                  id: "LOANS_AND_CREDIT",
                  label: "Apply for Loan / Credit",
                  icon: Coins,
                },
                {
                  id: "STANDING_ORDERS",
                  label: "Standing Orders",
                  icon: Repeat,
                },
                {
                  id: "SMART_CARDS",
                  label: "Virtual & Physical Cards",
                  icon: CreditCard,
                },
                {
                  id: "LEDGER",
                  label: "Wallet Statement",
                  icon: FileCheck2,
                },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setPortalTab(t.id as PortalTab)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition ${
                      portalTab === t.id
                        ? "bg-navy-900 text-gold-400 shadow-sm"
                        : "text-slate-600 hover:text-navy-900"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Top KPI Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-dbc-navy-gradient text-white rounded-2xl p-5 border border-gold-500/40 shadow-md flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-gold-300 font-semibold">
                  Prepaid Wallet Balance
                </span>
                <Wallet className="w-5 h-5 text-gold-400" />
              </div>
              <div className="my-3">
                <p className="text-2xl sm:text-3xl font-black tracking-tight">
                  {formatNgn(wallet?.balance)}
                </p>
                <p className="text-[11px] text-slate-300 mt-1">
                  Available:{" "}
                  <span className="text-emerald-300 font-bold">
                    {formatNgn(wallet?.availableBalance)}
                  </span>{" "}
                  • Reserve:{" "}
                  <span className="text-gold-300 font-semibold">
                    {formatNgn(wallet?.lockedBalance)}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setShowFundModal(true)}
                className="w-full py-2.5 rounded-xl bg-dbc-gold-gradient text-navy-950 font-extrabold text-xs shadow hover:opacity-95 transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Fund Prepaid Wallet (Flutterwave)
              </button>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                  Active Loan / Credit Balance
                </span>
                <Coins className="w-5 h-5 text-navy-800" />
              </div>
              <div className="my-3">
                <p className="text-2xl font-black text-navy-900">
                  {formatNgn(
                    (snapshot?.userLoans || [])
                      .filter(
                        (l: any) =>
                          l.status === "APPROVED_DISBURSED" ||
                          l.status === "OVERDUE"
                      )
                      .reduce(
                        (acc: number, l: any) =>
                          acc + Number(l.remainingBalance),
                        0
                      )
                  )}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Disbursed directly into Wallet {wallet?.accountNumber}
                </p>
              </div>
              <button
                onClick={() => setPortalTab("LOANS_AND_CREDIT")}
                className="text-xs font-bold text-navy-800 hover:text-gold-600 flex items-center gap-1"
              >
                Apply for Loan / Credit <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                  Wallet Standing Orders
                </span>
                <Repeat className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="my-3">
                <p className="text-2xl font-black text-navy-900">
                  {
                    (snapshot?.userStandingOrders || []).filter(
                      (s: any) => s.status === "ACTIVE"
                    ).length
                  }{" "}
                  <span className="text-sm font-semibold text-slate-500">
                    Active Mandate(s)
                  </span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Next Auto-Deduction:{" "}
                  <strong className="text-navy-900">
                    {formatNgn(
                      snapshot?.userStandingOrders?.[0]?.installmentAmount || 0
                    )}
                  </strong>
                </p>
              </div>
              <button
                onClick={() => setPortalTab("STANDING_ORDERS")}
                className="text-xs font-bold text-navy-800 hover:text-gold-600 flex items-center gap-1"
              >
                Manage Standing Orders <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                  Flutterwave Smart Cards
                </span>
                <CreditCard className="w-5 h-5 text-gold-600" />
              </div>
              <div className="my-3">
                <p className="text-2xl font-black text-navy-900">
                  {(snapshot?.userCards || []).length}{" "}
                  <span className="text-sm font-semibold text-slate-500">
                    Issued Cards
                  </span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Combined Card Balance:{" "}
                  <strong className="text-navy-900">
                    {formatNgn(
                      (snapshot?.userCards || []).reduce(
                        (acc: number, c: any) => acc + Number(c.cardBalance),
                        0
                      )
                    )}
                  </strong>
                </p>
              </div>
              <button
                onClick={() => setPortalTab("SMART_CARDS")}
                className="text-xs font-bold text-navy-800 hover:text-gold-600 flex items-center gap-1"
              >
                Virtual & Physical Cards{" "}
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Fund Wallet Modal */}
          {showFundModal && (
            <div className="fixed inset-0 z-50 bg-navy-950/75 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gold-600">
                      Flutterwave Payment Gateway
                    </span>
                    <h3 className="text-lg font-extrabold text-navy-900">
                      Fund Prepaid Wallet ({wallet?.accountNumber})
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowFundModal(false)}
                    className="text-xs text-slate-400 hover:text-slate-700 font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Amount to Prepay / Fund (NGN)
                    </label>
                    <input
                      type="number"
                      value={fundAmount}
                      onChange={(e) => setFundAmount(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-navy-900 focus:outline-none focus:border-navy-900"
                    />
                    <div className="flex gap-2 mt-2">
                      {[50000, 150000, 300000, 1000000].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setFundAmount(String(preset))}
                          className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-gold-100 text-navy-900 transition"
                        >
                          +{formatNgn(preset)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Flutterwave Payment Channel
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["BANK_TRANSFER", "CARD", "USSD"] as const).map(
                        (ch) => (
                          <button
                            key={ch}
                            type="button"
                            onClick={() => setFundChannel(ch)}
                            className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
                              fundChannel === ch
                                ? "bg-navy-900 text-gold-400 border-navy-900"
                                : "bg-slate-50 text-slate-600 border-slate-200"
                            }`}
                          >
                            {ch.replace("_", " ")}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                    <p>
                      • Funds settle immediately into your DB Capital Prepaid
                      Wallet.
                    </p>
                    <p>
                      • Your Wallet balance backs your{" "}
                      <strong>Standing Order loan repayments</strong> and{" "}
                      <strong>Smart Card funding</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowFundModal(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={busyAction === "FUND_WALLET"}
                    onClick={async () => {
                      const res = await runPlatformAction(
                        "FUND_WALLET",
                        {
                          userId: currentUser.id,
                          amount: Number(fundAmount),
                          paymentChannel: fundChannel,
                        },
                        `Successfully funded wallet with ${formatNgn(
                          fundAmount
                        )} via Flutterwave (${fundChannel})!`
                      );
                      if (res) setShowFundModal(false);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-dbc-gold-gradient text-navy-950 font-extrabold text-xs shadow hover:opacity-95"
                  >
                    {busyAction === "FUND_WALLET"
                      ? "Processing via Flutterwave..."
                      : `Complete Payment (${formatNgn(fundAmount)})`}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {portalTab === "OVERVIEW" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Active Standing Orders & Loans */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-extrabold text-navy-900 text-base">
                        Active Loans & Wallet Standing Order Repayments
                      </h3>
                      <p className="text-xs text-slate-500">
                        Loans are disbursed to your wallet and repaid via
                        automated Standing Orders based on Super Admin
                        parameters.
                      </p>
                    </div>
                    <button
                      onClick={() => setPortalTab("LOANS_AND_CREDIT")}
                      className="px-3 py-1.5 rounded-lg bg-navy-900 text-gold-400 text-xs font-bold"
                    >
                      + New Loan / Credit
                    </button>
                  </div>

                  <div className="space-y-4">
                    {(snapshot?.userLoans || []).map((loan: any) => (
                      <div
                        key={loan.id}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <span className="text-[11px] font-mono font-bold text-slate-500">
                              {loan.reference} • Rule: {loan.parameterCode}
                            </span>
                            <h4 className="font-bold text-navy-900 text-sm">
                              {loan.parameterName} — {loan.purpose}
                            </h4>
                          </div>
                          <span
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                              loan.status === "APPROVED_DISBURSED"
                                ? "bg-emerald-100 text-emerald-800"
                                : loan.status === "REPAID"
                                ? "bg-blue-100 text-blue-800"
                                : loan.status === "OVERDUE"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {loan.status.replace("_", " ")}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white p-3 rounded-lg border border-slate-200/80">
                          <div>
                            <span className="text-slate-400 block">
                              Disbursed Principal
                            </span>
                            <span className="font-extrabold text-navy-900">
                              {formatNgn(loan.principalAmount)}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">
                              Total Payable ({loan.interestRatePercent}%/cycle)
                            </span>
                            <span className="font-extrabold text-navy-900">
                              {formatNgn(loan.totalPayable)}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">
                              Paid via Standing Order
                            </span>
                            <span className="font-extrabold text-emerald-700">
                              {formatNgn(loan.amountPaid)}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">
                              Remaining Balance
                            </span>
                            <span className="font-extrabold text-navy-900">
                              {formatNgn(loan.remainingBalance)}
                            </span>
                          </div>
                        </div>

                        {loan.standingOrder && (
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                            <div className="flex items-center gap-2 text-slate-600">
                              <Repeat className="w-4 h-4 text-gold-600" />
                              <span>
                                Mandate{" "}
                                <strong className="font-mono text-navy-900">
                                  {loan.standingOrder.mandateReference}
                                </strong>{" "}
                                • {formatNgn(loan.installmentAmount)} /{" "}
                                {loan.frequency} ({loan.standingOrder.completedInstallments}
                                /{loan.standingOrder.totalInstallments} paid)
                              </span>
                            </div>
                            {loan.status === "APPROVED_DISBURSED" ||
                            loan.status === "OVERDUE" ? (
                              <button
                                disabled={
                                  busyAction === "EXECUTE_STANDING_ORDER"
                                }
                                onClick={() =>
                                  runPlatformAction(
                                    "EXECUTE_STANDING_ORDER",
                                    {
                                      standingOrderId: loan.standingOrder.id,
                                      triggeredBy: "CUSTOMER_PORTAL",
                                    },
                                    `Executed Standing Order installment check for ${loan.reference}!`
                                  )
                                }
                                className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition"
                              >
                                Run Next Wallet Deduction Now
                              </button>
                            ) : loan.status === "UNDER_REVIEW" ? (
                              <button
                                onClick={() => {
                                  setPlatformMode("BACK_OFFICE");
                                  setAdminTab("LOAN_DISBURSEMENTS");
                                }}
                                className="text-xs font-bold text-gold-600 underline"
                              >
                                Approve & Disburse in Super Admin →
                              </button>
                            ) : null}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Recent Prepaid Wallet Ledger */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-extrabold text-navy-900 text-base">
                      Recent Wallet Activity
                    </h3>
                    <button
                      onClick={() => setPortalTab("LEDGER")}
                      className="text-xs font-bold text-navy-800 hover:text-gold-600"
                    >
                      Full Statement →
                    </button>
                  </div>
                  <div className="space-y-3">
                    {(snapshot?.transactions || [])
                      .slice(0, 6)
                      .map((tx: any) => (
                        <div
                          key={tx.id}
                          className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70"
                        >
                          <div className="flex items-start gap-2.5">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                tx.type === "CREDIT"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-rose-100 text-rose-700"
                              }`}
                            >
                              {tx.type === "CREDIT" ? (
                                <ArrowDownLeft className="w-4 h-4" />
                              ) : (
                                <ArrowUpRight className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-navy-900">
                                {tx.description}
                              </p>
                              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                                {tx.reference} • {tx.category}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p
                              className={`text-xs font-extrabold ${
                                tx.type === "CREDIT"
                                  ? "text-emerald-700"
                                  : "text-rose-700"
                              }`}
                            >
                              {tx.type === "CREDIT" ? "+" : "-"}
                              {formatNgn(tx.amount)}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Bal: {formatNgn(tx.balanceAfter)}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: APPLY FOR LOAN & CREDIT (WITH STANDING ORDER SETUP) */}
          {portalTab === "LOANS_AND_CREDIT" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gold-600">
                    Wallet-Disbursed Credit Engine
                  </span>
                  <h3 className="text-xl font-extrabold text-navy-900">
                    Apply for Loan / Credit & Authorize Wallet Standing Order
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Select a facility below. Repayment terms are governed by{" "}
                    <strong>Super Admin Repayment Parameters</strong>, and
                    approved funds are disbursed directly into your DB Capital
                    Prepaid Wallet.
                  </p>
                </div>

                {/* Product Parameter Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    1. Select Super Admin Credit / Loan Product
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {repaymentParameters.map((p: any) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedParamId(p.id);
                          if (
                            Number(loanPrincipal) < Number(p.minAmount) ||
                            Number(loanPrincipal) > Number(p.maxAmount)
                          ) {
                            setLoanPrincipal(String(p.minAmount * 2));
                          }
                        }}
                        className={`text-left p-3.5 rounded-xl border transition ${
                          selectedParam?.id === p.id
                            ? "bg-navy-900 text-white border-gold-500 shadow-md"
                            : "bg-slate-50 text-navy-900 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-gold-500/20 text-gold-400 font-bold">
                            {p.code}
                          </span>
                          <span className="text-xs font-bold text-gold-400">
                            {p.interestRatePercent}% / {p.repaymentFrequency}
                          </span>
                        </div>
                        <p className="font-bold text-sm mt-1.5">{p.name}</p>
                        <p
                          className={`text-[11px] mt-1 ${
                            selectedParam?.id === p.id
                              ? "text-slate-300"
                              : "text-slate-500"
                          }`}
                        >
                          Tenure: {p.tenureCount} installments • Limit:{" "}
                          {formatNgn(p.minAmount)} – {formatNgn(p.maxAmount)}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      2. Principal Amount to Disburse to Wallet (NGN)
                    </label>
                    <input
                      type="number"
                      value={loanPrincipal}
                      onChange={(e) => setLoanPrincipal(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-navy-900"
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Allowed range: {formatNgn(selectedParam?.minAmount)} –{" "}
                      {formatNgn(selectedParam?.maxAmount)}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      3. Purpose of Facility
                    </label>
                    <input
                      type="text"
                      value={loanPurpose}
                      onChange={(e) => setLoanPurpose(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-navy-900"
                    />
                  </div>
                </div>

                {/* Mandatory Standing Order Mandate Box */}
                <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-300 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                      <Repeat className="w-4 h-4 text-amber-700" />
                      4. Mandatory Prepaid Wallet Standing Order Mandate
                    </span>
                    <span className="text-[11px] font-mono font-bold text-amber-800">
                      Rule: {selectedParam?.code}
                    </span>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    By authorizing this Standing Order, your DB Capital Prepaid
                    Wallet (<strong>{wallet?.accountNumber}</strong>) will be
                    automatically debited{" "}
                    <strong>{formatNgn(previewInstallment)}</strong> every{" "}
                    <strong>{selectedParam?.repaymentFrequency}</strong> for{" "}
                    <strong>{previewTenure} installments</strong>. Super Admin
                    parameters require a{" "}
                    <strong>
                      {selectedParam?.minWalletReservePercent}% wallet reserve (
                      {formatNgn(previewMinWalletReserve)})
                    </strong>{" "}
                    and apply a{" "}
                    <strong>
                      {selectedParam?.latePenaltyPercent}% late fee
                    </strong>{" "}
                    after a {selectedParam?.gracePeriodDays}-day grace period if
                    your wallet is unfunded on a due date.
                  </p>
                  <label className="flex items-center gap-2.5 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={standingOrderAccepted}
                      onChange={(e) =>
                        setStandingOrderAccepted(e.target.checked)
                      }
                      className="w-4 h-4 accent-navy-900 rounded"
                    />
                    <span className="text-xs font-bold text-navy-900">
                      I authorize DB Capital to set up this Standing Order on my
                      Prepaid Wallet ({wallet?.accountNumber}).
                    </span>
                  </label>
                </div>

                <button
                  type="button"
                  disabled={busyAction === "APPLY_LOAN_WITH_STANDING_ORDER"}
                  onClick={() =>
                    runPlatformAction(
                      "APPLY_LOAN_WITH_STANDING_ORDER",
                      {
                        userId: currentUser.id,
                        repaymentParameterId: selectedParam.id,
                        principalAmount: Number(loanPrincipal),
                        purpose: loanPurpose,
                        standingOrderAuthorized: standingOrderAccepted,
                      },
                      `Loan application submitted with active Wallet Standing Order (${formatNgn(
                        previewInstallment
                      )} / ${
                        selectedParam.repaymentFrequency
                      })! Ready for Super Admin disbursement.`
                    )
                  }
                  className="w-full py-3.5 rounded-xl bg-dbc-navy-gradient text-gold-400 font-extrabold text-sm shadow-lg hover:opacity-95 transition flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {busyAction === "APPLY_LOAN_WITH_STANDING_ORDER"
                    ? "Binding Standing Order & Submitting..."
                    : `Authorize Standing Order & Apply for ${formatNgn(
                        previewPrincipal
                      )}`}
                </button>
              </div>

              {/* Right Column: Live Amortization & Super Admin Parameter Inspector */}
              <div className="lg:col-span-5 space-y-5">
                <div className="bg-dbc-navy-gradient text-white rounded-2xl p-6 border border-gold-500/40 shadow-lg space-y-4">
                  <div className="flex items-center justify-between border-b border-white/15 pb-3">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-gold-400 font-bold">
                        Super Admin Parameter Preview
                      </span>
                      <h4 className="text-base font-extrabold">
                        {selectedParam?.name}
                      </h4>
                    </div>
                    <span className="text-xs font-mono px-2.5 py-1 rounded bg-white/10 text-gold-300">
                      {selectedParam?.code}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                      <span className="text-slate-400 block">
                        Wallet Disbursement
                      </span>
                      <span className="text-base font-black text-white">
                        {formatNgn(previewPrincipal)}
                      </span>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                      <span className="text-slate-400 block">
                        Total Interest ({selectedParam?.interestRatePercent}% ×{" "}
                        {previewTenure})
                      </span>
                      <span className="text-base font-black text-gold-300">
                        {formatNgn(previewTotalInterest)}
                      </span>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                      <span className="text-slate-400 block">
                        Total Repayable
                      </span>
                      <span className="text-base font-black text-white">
                        {formatNgn(previewTotalPayable)}
                      </span>
                    </div>
                    <div className="bg-gold-500/20 p-3 rounded-xl border border-gold-400/40">
                      <span className="text-gold-300 block font-semibold">
                        Standing Order Deduction
                      </span>
                      <span className="text-base font-black text-white">
                        {formatNgn(previewInstallment)} /{" "}
                        {selectedParam?.repaymentFrequency}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs space-y-1.5 text-slate-300 border-t border-white/10 pt-3">
                    <div className="flex justify-between">
                      <span>Required Wallet Buffer Reserve:</span>
                      <strong className="text-gold-300">
                        {formatNgn(previewMinWalletReserve)} (
                        {selectedParam?.minWalletReservePercent}%)
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Your Current Wallet Balance:</span>
                      <strong className="text-emerald-400">
                        {formatNgn(wallet?.balance)}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Grace Period / Late Penalty:</span>
                      <strong>
                        {selectedParam?.gracePeriodDays} days /{" "}
                        {selectedParam?.latePenaltyPercent}%
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOMER STANDING ORDERS & SCHEDULE */}
          {portalTab === "STANDING_ORDERS" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gold-600">
                      Automated Wallet Repayment Mandates
                    </span>
                    <h3 className="text-xl font-extrabold text-navy-900">
                      My Wallet Standing Orders & Deduction Logs
                    </h3>
                    <p className="text-xs text-slate-500">
                      Each loan or credit facility is linked to a Standing Order
                      that deducts scheduled installments directly from your
                      prepaid wallet ({wallet?.accountNumber}).
                    </p>
                  </div>
                  <button
                    onClick={() => setShowFundModal(true)}
                    className="px-4 py-2 rounded-xl bg-navy-900 text-gold-400 text-xs font-bold"
                  >
                    + Top Up Wallet for Upcoming Deductions
                  </button>
                </div>

                <div className="space-y-5">
                  {(snapshot?.userStandingOrders || []).map((so: any) => (
                    <div
                      key={so.id}
                      className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded bg-navy-900 text-gold-400">
                              {so.mandateReference}
                            </span>
                            <span className="text-xs font-bold text-slate-600">
                              Loan: {so.loanReference} ({so.parameterName})
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Deduction Rule:{" "}
                            <strong className="text-navy-900">
                              {formatNgn(so.installmentAmount)}
                            </strong>{" "}
                            every <strong>{so.frequency}</strong> • Next Date:{" "}
                            <strong>{so.nextExecutionDate}</strong>
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full ${
                              so.status === "ACTIVE"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {so.status} ({so.completedInstallments}/
                            {so.totalInstallments} Installments)
                          </span>
                          {so.status === "ACTIVE" &&
                            (so.loanStatus === "APPROVED_DISBURSED" ||
                              so.loanStatus === "OVERDUE") && (
                              <button
                                disabled={
                                  busyAction === "EXECUTE_STANDING_ORDER"
                                }
                                onClick={() =>
                                  runPlatformAction(
                                    "EXECUTE_STANDING_ORDER",
                                    {
                                      standingOrderId: so.id,
                                      triggeredBy: "CUSTOMER_MANUAL_TRIGGER",
                                    },
                                    `Standing Order ${so.mandateReference} executed against Wallet ${wallet?.accountNumber}!`
                                  )
                                }
                                className="px-3.5 py-2 rounded-xl bg-dbc-gold-gradient text-navy-950 font-extrabold text-xs shadow"
                              >
                                Execute Wallet Deduction Now
                              </button>
                            )}
                        </div>
                      </div>

                      {/* Execution History */}
                      <div className="bg-white rounded-xl p-3.5 border border-slate-200">
                        <p className="text-xs font-bold text-navy-900 mb-2">
                          Standing Order Execution Audit Trail
                        </p>
                        {(so.executions || []).length === 0 ? (
                          <p className="text-xs text-slate-400">
                            No installment deductions executed yet.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {(so.executions || []).map((ex: any) => (
                              <div
                                key={ex.id}
                                className="flex flex-wrap items-center justify-between gap-2 text-xs p-2 rounded-lg bg-slate-50 border border-slate-100"
                              >
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                                      ex.status === "SUCCESS"
                                        ? "bg-emerald-100 text-emerald-800"
                                        : "bg-rose-100 text-rose-800"
                                    }`}
                                  >
                                    {ex.status}
                                  </span>
                                  <span className="font-semibold text-navy-900">
                                    Installment #{ex.installmentNumber}:{" "}
                                    {formatNgn(ex.amountAttempted)}
                                  </span>
                                  <span className="text-slate-500">
                                    — {ex.notes}
                                  </span>
                                </div>
                                <span className="font-mono text-[11px] text-slate-400">
                                  {new Date(ex.executedAt).toLocaleDateString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VIRTUAL & PHYSICAL SMART CARDS (POWERED BY FLUTTERWAVE) */}
          {portalTab === "SMART_CARDS" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Customer's Existing Cards */}
              <div className="lg:col-span-7 space-y-5">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-gold-600">
                        Flutterwave Card Issuing Engine
                      </span>
                      <h3 className="text-xl font-extrabold text-navy-900">
                        My Virtual & Physical Smart Cards
                      </h3>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-navy-900 text-gold-400 font-semibold">
                      {(snapshot?.userCards || []).length} Active Card(s)
                    </span>
                  </div>

                  <div className="space-y-5">
                    {(snapshot?.userCards || []).map((card: any) => {
                      const isRevealed = !!revealedCards[card.id];
                      return (
                        <div
                          key={card.id}
                          className="rounded-2xl border border-slate-200 p-5 bg-slate-50 space-y-4"
                        >
                          {/* Visual Smart Card */}
                          <div
                            className={`rounded-2xl p-5 text-white shadow-xl border relative overflow-hidden ${
                              card.status === "FROZEN"
                                ? "bg-slate-800 border-slate-600 opacity-80"
                                : card.cardType === "PHYSICAL"
                                ? "bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 border-gold-500"
                                : "bg-gradient-to-br from-navy-900 via-indigo-950 to-navy-950 border-gold-400/50"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-5">
                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-gold-500 text-navy-950">
                                  {card.cardType} CARD
                                </span>
                                <span className="text-xs text-gold-300 font-bold">
                                  {card.cardBrand} • {card.cardTier}
                                </span>
                              </div>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  card.status === "ACTIVE"
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                                    : "bg-rose-500/30 text-rose-200"
                                }`}
                              >
                                {card.status}
                              </span>
                            </div>

                            <p className="font-mono text-xl sm:text-2xl tracking-widest font-bold text-gold-300 my-4">
                              {isRevealed ? card.fullPanMock : card.maskedPan}
                            </p>

                            <div className="grid grid-cols-4 gap-2 text-xs border-t border-white/10 pt-3">
                              <div>
                                <span className="text-[10px] text-slate-400 block">
                                  CARDHOLDER
                                </span>
                                <span className="font-bold truncate block">
                                  {card.cardholderName}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 block">
                                  EXPIRES
                                </span>
                                <span className="font-bold">
                                  {card.expiryMonth}/{card.expiryYear}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 block">
                                  CVV
                                </span>
                                <span className="font-mono font-bold">
                                  {isRevealed ? card.cvvMock : "•••"}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] text-gold-300 block">
                                  CARD BALANCE
                                </span>
                                <span className="font-extrabold text-white">
                                  {formatNgn(card.cardBalance)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Card Metadata & Actions */}
                          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                            <div className="space-y-0.5 text-slate-600">
                              <p>
                                Flutterwave ID:{" "}
                                <strong className="font-mono text-navy-900">
                                  {card.flutterwaveCardId}
                                </strong>
                              </p>
                              {card.cardType === "PHYSICAL" && (
                                <p className="flex items-center gap-1 text-slate-500">
                                  <Truck className="w-3.5 h-3.5 text-gold-600" />
                                  Delivery:{" "}
                                  <strong className="text-navy-900">
                                    {card.deliveryStatus}
                                  </strong>{" "}
                                  ({card.deliveryAddress})
                                </p>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setRevealedCards((prev) => ({
                                    ...prev,
                                    [card.id]: !prev[card.id],
                                  }))
                                }
                                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-navy-900 font-bold flex items-center gap-1"
                              >
                                {isRevealed ? (
                                  <>
                                    <EyeOff className="w-3.5 h-3.5" /> Hide PAN
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-3.5 h-3.5" /> Reveal PAN
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  runPlatformAction(
                                    "MANAGE_SMART_CARD",
                                    {
                                      cardId: card.id,
                                      action:
                                        card.status === "ACTIVE"
                                          ? "FREEZE"
                                          : "UNFREEZE",
                                    },
                                    `Smart Card ${card.maskedPan} status updated via Flutterwave Gateway!`
                                  )
                                }
                                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-navy-900 font-bold flex items-center gap-1"
                              >
                                {card.status === "ACTIVE" ? (
                                  <>
                                    <Lock className="w-3.5 h-3.5 text-rose-600" />{" "}
                                    Freeze Card
                                  </>
                                ) : (
                                  <>
                                    <Unlock className="w-3.5 h-3.5 text-emerald-600" />{" "}
                                    Unfreeze Card
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Top Up Card from Wallet Bar */}
                          {card.status === "ACTIVE" && (
                            <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                              <input
                                type="number"
                                placeholder="Amount from Wallet (e.g. 20000)"
                                value={cardTopUpAmount[card.id] || ""}
                                onChange={(e) =>
                                  setCardTopUpAmount((prev) => ({
                                    ...prev,
                                    [card.id]: e.target.value,
                                  }))
                                }
                                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  runPlatformAction(
                                    "FUND_SMART_CARD",
                                    {
                                      cardId: card.id,
                                      amount: Number(
                                        cardTopUpAmount[card.id] || 20000
                                      ),
                                    },
                                    `Transferred ${formatNgn(
                                      cardTopUpAmount[card.id] || 20000
                                    )} from Prepaid Wallet to Flutterwave Card ${
                                      card.maskedPan
                                    }!`
                                  )
                                }
                                className="px-4 py-2 rounded-xl bg-navy-900 text-gold-400 font-bold text-xs shrink-0"
                              >
                                Fund Card from Wallet
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Apply for New Virtual or Physical Card */}
              <div className="lg:col-span-5">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gold-600">
                      Powered by Flutterwave Gateway
                    </span>
                    <h3 className="text-lg font-extrabold text-navy-900">
                      Apply for Virtual or Physical Smart Card
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Card issuance fee and initial load are deducted directly
                      from your DB Capital Prepaid Wallet.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      1. Card Form Factor
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {(["VIRTUAL", "PHYSICAL"] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setCardType(type)}
                          className={`p-3 rounded-xl border text-left transition ${
                            cardType === type
                              ? "bg-navy-900 text-white border-gold-500"
                              : "bg-slate-50 text-navy-900 border-slate-200"
                          }`}
                        >
                          <p className="text-xs font-extrabold">
                            {type} SMART CARD
                          </p>
                          <p className="text-[11px] opacity-80 mt-0.5">
                            {type === "VIRTUAL"
                              ? "Instant Online Issuance (₦1,000 fee)"
                              : "Embossed Gold Card + Courier (₦2,500 fee)"}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        2. Card Scheme
                      </label>
                      <select
                        value={cardBrand}
                        onChange={(e) => setCardBrand(e.target.value as any)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-navy-900"
                      >
                        <option value="MASTERCARD">Mastercard</option>
                        <option value="VERVE">Verve</option>
                        <option value="VISA">Visa</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        3. Card Tier
                      </label>
                      <select
                        value={cardTier}
                        onChange={(e) => setCardTier(e.target.value as any)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-navy-900"
                      >
                        <option value="GOLD_EXECUTIVE">
                          Gold Executive (₦3M Limit)
                        </option>
                        <option value="PLATINUM_BUSINESS">
                          Platinum Business (₦10M Limit)
                        </option>
                        <option value="CLASSIC_SMART">
                          Classic Smart (₦1M Limit)
                        </option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      4. Initial Wallet-to-Card Funding Amount (NGN)
                    </label>
                    <input
                      type="number"
                      value={cardInitialFund}
                      onChange={(e) => setCardInitialFund(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-navy-900"
                    />
                  </div>

                  {cardType === "PHYSICAL" && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        5. Physical Card Courier Delivery Address
                      </label>
                      <input
                        type="text"
                        value={cardDeliveryAddress}
                        onChange={(e) => setCardDeliveryAddress(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-navy-900"
                      />
                    </div>
                  )}

                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cardCreditLinked}
                      onChange={(e) => setCardCreditLinked(e.target.checked)}
                      className="w-4 h-4 accent-navy-900"
                    />
                    Link card to DB Capital Smart Card Credit Line & Wallet
                  </label>

                  <button
                    type="button"
                    disabled={busyAction === "ISSUE_SMART_CARD"}
                    onClick={() =>
                      runPlatformAction(
                        "ISSUE_SMART_CARD",
                        {
                          userId: currentUser.id,
                          cardType,
                          cardBrand,
                          cardTier,
                          initialFundingAmount: Number(cardInitialFund),
                          creditLineLinked: cardCreditLinked,
                          deliveryAddress:
                            cardType === "PHYSICAL"
                              ? cardDeliveryAddress
                              : undefined,
                        },
                        `Issued new Flutterwave ${cardType} ${cardBrand} Smart Card and funded ${formatNgn(
                          cardInitialFund
                        )} from your wallet!`
                      )
                    }
                    className="w-full py-3 rounded-xl bg-dbc-gold-gradient text-navy-950 font-extrabold text-xs shadow-md hover:opacity-95 transition"
                  >
                    {busyAction === "ISSUE_SMART_CARD"
                      ? "Provisioning via Flutterwave Gateway..."
                      : `Issue ${cardType} Card (Wallet Debit: ${formatNgn(
                          Number(cardInitialFund || 0) +
                            (cardType === "PHYSICAL" ? 2500 : 1000)
                        )})`}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CUSTOMER WALLET LEDGER STATEMENT */}
          {portalTab === "LEDGER" && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-extrabold text-navy-900">
                    Prepaid Wallet Double-Entry Statement ({wallet?.accountNumber})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Complete audit trail of Flutterwave wallet funding, loan
                    disbursements, standing order repayments, and card loads.
                  </p>
                </div>
                <button
                  onClick={() => setShowFundModal(true)}
                  className="px-4 py-2 rounded-xl bg-dbc-gold-gradient text-navy-950 font-extrabold text-xs"
                >
                  + Fund Prepaid Wallet
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase text-[11px]">
                      <th className="py-3 px-3">Reference</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Description</th>
                      <th className="py-3 px-3">Gateway</th>
                      <th className="py-3 px-3 text-right">Amount</th>
                      <th className="py-3 px-3 text-right">Balance After</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(snapshot?.transactions || []).map((tx: any) => (
                      <tr key={tx.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-mono font-bold text-navy-900">
                          {tx.reference}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
                            {tx.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-700">
                          {tx.description}
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                          {tx.gatewayProvider}
                        </td>
                        <td
                          className={`py-3 px-3 text-right font-extrabold ${
                            tx.type === "CREDIT"
                              ? "text-emerald-700"
                              : "text-rose-700"
                          }`}
                        >
                          {tx.type === "CREDIT" ? "+" : "-"}
                          {formatNgn(tx.amount)}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-navy-900">
                          {formatNgn(tx.balanceAfter)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      )}

      {/* ===================================================================== */}
      {/* VIEW 3: SUPER ADMIN BACK OFFICE                                       */}
      {/* ===================================================================== */}
      {platformMode === "BACK_OFFICE" && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Admin Header & Navigation */}
          <div className="bg-dbc-navy-gradient text-white rounded-2xl p-5 border border-gold-500/40 shadow-lg flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-gold-500 text-navy-950 font-black text-[10px] uppercase">
                  Super Admin Back Office
                </span>
                <span className="text-xs text-gold-300 font-semibold">
                  Operate • Monitor • Report
                </span>
              </div>
              <h2 className="text-xl font-extrabold mt-1">
                Credit Parameters, Wallet Disbursements & Standing Order Engine
              </h2>
            </div>

            <div className="flex flex-wrap gap-1.5 bg-navy-950/80 p-1.5 rounded-xl border border-white/10">
              {[
                {
                  id: "REPAYMENT_PARAMS",
                  label: "1. Repayment Parameters",
                  icon: Settings,
                },
                {
                  id: "LOAN_DISBURSEMENTS",
                  label: "2. Loan Approvals & Wallet Disbursement",
                  icon: Coins,
                },
                {
                  id: "STANDING_ORDER_ENGINE",
                  label: "3. Standing Order Runner",
                  icon: Repeat,
                },
                {
                  id: "CARD_OPERATIONS",
                  label: "4. Flutterwave Cards & Gateway",
                  icon: CreditCard,
                },
                {
                  id: "SYSTEM_LEDGER",
                  label: "5. Master Ledger",
                  icon: Server,
                },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setAdminTab(t.id as AdminTab)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition ${
                      adminTab === t.id
                        ? "bg-dbc-gold-gradient text-navy-950 shadow"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ADMIN TAB 1: REPAYMENT PARAMETERS CONFIGURATOR */}
          {adminTab === "REPAYMENT_PARAMS" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Existing Parameters */}
              <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-extrabold text-navy-900">
                      Super Admin Repayment Parameters
                    </h3>
                    <p className="text-xs text-slate-500">
                      These parameters govern customer Standing Orders, interest
                      calculations, wallet reserve buffers, and late penalties.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingParamId(null);
                      setParamName("SME Fast-Track Inventory Line");
                      setParamCode(
                        `DBC-BF-${Math.floor(10 + Math.random() * 89)}`
                      );
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-navy-900"
                  >
                    + New Parameter Preset
                  </button>
                </div>

                <div className="space-y-3">
                  {repaymentParameters.map((p: any) => (
                    <div
                      key={p.id}
                      className={`p-4 rounded-xl border transition ${
                        editingParamId === p.id
                          ? "border-gold-500 bg-gold-100/20"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-navy-900 text-gold-400">
                              {p.code}
                            </span>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                              {p.category}
                            </span>
                          </div>
                          <h4 className="font-bold text-navy-900 text-sm mt-1">
                            {p.name}
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => loadParamIntoEditor(p)}
                          className="px-3 py-1.5 rounded-lg bg-navy-900 text-gold-400 text-xs font-bold"
                        >
                          Edit Parameter Rules
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-200/80 text-xs">
                        <div>
                          <span className="text-slate-400 block">
                            Interest / Cycle
                          </span>
                          <strong className="text-navy-900">
                            {p.interestRatePercent}% ({p.repaymentFrequency})
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block">
                            Tenure Installments
                          </span>
                          <strong className="text-navy-900">
                            {p.tenureCount} Cycles
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block">
                            Wallet Reserve Req.
                          </span>
                          <strong className="text-emerald-700">
                            {p.minWalletReservePercent}% of installment
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block">
                            Grace / Late Penalty
                          </span>
                          <strong className="text-rose-700">
                            {p.gracePeriodDays}d / {p.latePenaltyPercent}%
                          </strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Create / Update Parameter Form */}
              <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gold-600">
                    {editingParamId
                      ? `Editing Rule (${paramCode})`
                      : "Create New Repayment Rule"}
                  </span>
                  <h3 className="text-lg font-extrabold text-navy-900">
                    Configure Standing Order & Repayment Parameters
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Product Name
                      </label>
                      <input
                        type="text"
                        value={paramName}
                        onChange={(e) => setParamName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Parameter Code
                      </label>
                      <input
                        type="text"
                        value={paramCode}
                        onChange={(e) => setParamCode(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Category
                      </label>
                      <select
                        value={paramCategory}
                        onChange={(e) =>
                          setParamCategory(e.target.value as any)
                        }
                        className="w-full px-2.5 py-2 rounded-lg border border-slate-300 font-bold"
                      >
                        <option value="PERSONAL_LOAN">Personal Loan</option>
                        <option value="BUSINESS_FINANCE">
                          Business Finance
                        </option>
                        <option value="SMART_CARD_CREDIT">
                          Smart Card Credit
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Standing Order Freq.
                      </label>
                      <select
                        value={paramFreq}
                        onChange={(e) => setParamFreq(e.target.value as any)}
                        className="w-full px-2.5 py-2 rounded-lg border border-slate-300 font-bold"
                      >
                        <option value="WEEKLY">WEEKLY</option>
                        <option value="BIWEEKLY">BIWEEKLY</option>
                        <option value="MONTHLY">MONTHLY</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Installments Count
                      </label>
                      <input
                        type="number"
                        value={paramTenure}
                        onChange={(e) => setParamTenure(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Interest Rate (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={paramRate}
                        onChange={(e) => setParamRate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Wallet Reserve (%)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={paramReserve}
                        onChange={(e) => setParamReserve(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Late Penalty (%)
                      </label>
                      <input
                        type="number"
                        step="0.25"
                        value={paramPenalty}
                        onChange={(e) => setParamPenalty(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Min Principal (NGN)
                      </label>
                      <input
                        type="number"
                        value={paramMinAmt}
                        onChange={(e) => setParamMinAmt(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Max Principal (NGN)
                      </label>
                      <input
                        type="number"
                        value={paramMaxAmt}
                        onChange={(e) => setParamMaxAmt(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Grace Period (Days)
                      </label>
                      <input
                        type="number"
                        value={paramGrace}
                        onChange={(e) => setParamGrace(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Min Credit Score
                      </label>
                      <input
                        type="number"
                        value={paramMinScore}
                        onChange={(e) => setParamMinScore(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={busyAction === "UPSERT_REPAYMENT_PARAMETER"}
                  onClick={async () => {
                    await runPlatformAction(
                      "UPSERT_REPAYMENT_PARAMETER",
                      {
                        id: editingParamId || undefined,
                        name: paramName,
                        code: paramCode,
                        category: paramCategory,
                        interestRatePercent: Number(paramRate),
                        repaymentFrequency: paramFreq,
                        tenureCount: Number(paramTenure),
                        minAmount: Number(paramMinAmt),
                        maxAmount: Number(paramMaxAmt),
                        gracePeriodDays: Number(paramGrace),
                        latePenaltyPercent: Number(paramPenalty),
                        minWalletReservePercent: Number(paramReserve),
                        minCreditScore: Number(paramMinScore),
                      },
                      `Saved Super Admin Repayment Parameter '${paramName} (${paramCode})'!`
                    );
                    setEditingParamId(null);
                  }}
                  className="w-full py-3 rounded-xl bg-dbc-gold-gradient text-navy-950 font-extrabold text-xs shadow hover:opacity-95"
                >
                  {editingParamId
                    ? `Update Repayment Parameter (${paramCode})`
                    : "Save New Repayment Parameter"}
                </button>
              </div>
            </div>
          )}

          {/* ADMIN TAB 2: LOAN APPROVALS & WALLET DISBURSEMENT */}
          {adminTab === "LOAN_DISBURSEMENTS" && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div>
                <h3 className="text-lg font-extrabold text-navy-900">
                  Loan & Credit Applications — Disburse Directly to Customer
                  Wallet
                </h3>
                <p className="text-xs text-slate-500">
                  Verify that the customer&apos;s Standing Order mandate is active,
                  then click <strong>Approve & Disburse to Wallet</strong> to
                  credit their prepaid wallet immediately.
                </p>
              </div>

              <div className="space-y-4">
                {(snapshot?.admin?.allLoans || []).map((loan: any) => (
                  <div
                    key={loan.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-extrabold px-2.5 py-0.5 rounded bg-navy-900 text-gold-400">
                          {loan.reference}
                        </span>
                        <span className="text-xs font-bold text-navy-900">
                          {loan.customerName} ({loan.accountType})
                        </span>
                        <span className="text-xs text-slate-500">
                          • Wallet:{" "}
                          <strong className="font-mono">
                            {loan.walletAccountNumber}
                          </strong>{" "}
                          (Bal: {formatNgn(loan.walletBalance)})
                        </span>
                      </div>
                      <p className="text-sm font-bold text-navy-900">
                        {loan.parameterName} ({loan.parameterCode}) —{" "}
                        {loan.purpose}
                      </p>
                      <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                        <span>
                          Principal:{" "}
                          <strong className="text-navy-900">
                            {formatNgn(loan.principalAmount)}
                          </strong>
                        </span>
                        <span>
                          Total Payable:{" "}
                          <strong className="text-navy-900">
                            {formatNgn(loan.totalPayable)}
                          </strong>
                        </span>
                        <span>
                          Standing Order:{" "}
                          <strong className="font-mono text-emerald-700">
                            {loan.mandateReference} ({formatNgn(loan.installmentAmount)}{" "}
                            / {loan.frequency})
                          </strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          loan.status === "UNDER_REVIEW"
                            ? "bg-amber-100 text-amber-800"
                            : loan.status === "APPROVED_DISBURSED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {loan.status}
                      </span>

                      {loan.status === "UNDER_REVIEW" && (
                        <>
                          <button
                            type="button"
                            disabled={
                              busyAction === "APPROVE_AND_DISBURSE_LOAN"
                            }
                            onClick={() =>
                              runPlatformAction(
                                "APPROVE_AND_DISBURSE_LOAN",
                                {
                                  loanApplicationId: loan.id,
                                },
                                `Approved ${loan.reference} and disbursed ${formatNgn(
                                  loan.principalAmount
                                )} directly into ${loan.customerName}'s Wallet (${
                                  loan.walletAccountNumber
                                })!`
                              )
                            }
                            className="px-4 py-2.5 rounded-xl bg-dbc-gold-gradient text-navy-950 font-extrabold text-xs shadow hover:opacity-95"
                          >
                            Approve & Disburse {formatNgn(loan.principalAmount)}{" "}
                            to Wallet
                          </button>
                          <button
                            type="button"
                            disabled={busyAction === "REJECT_LOAN"}
                            onClick={() =>
                              runPlatformAction(
                                "REJECT_LOAN",
                                {
                                  loanApplicationId: loan.id,
                                },
                                `Rejected ${loan.reference} and unlocked customer Standing Order wallet reserve.`
                              )
                            }
                            className="px-3.5 py-2.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ADMIN TAB 3: STANDING ORDER ENGINE & SCHEDULER */}
          {adminTab === "STANDING_ORDER_ENGINE" && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-extrabold text-navy-900">
                    Standing Order Automated Wallet Deduction Engine
                  </h3>
                  <p className="text-xs text-slate-500">
                    Trigger scheduled Standing Order repayments against customer
                    prepaid wallets. If a wallet balance is lower than the
                    installment amount, the Super Admin late penalty parameter
                    is automatically applied.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busyAction === "RUN_BATCH_STANDING_ORDERS"}
                  onClick={() =>
                    runPlatformAction(
                      "RUN_BATCH_STANDING_ORDERS",
                      {},
                      "Executed Batch Standing Order Cycle across all active disbursed loans!"
                    )
                  }
                  className="px-4 py-2.5 rounded-xl bg-dbc-navy-gradient text-gold-400 font-extrabold text-xs shadow flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Run Batch Standing Order Cycle (All Active)
                </button>
              </div>

              <div className="space-y-4">
                {(snapshot?.admin?.allStandingOrders || []).map((so: any) => (
                  <div
                    key={so.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-navy-900 text-gold-400">
                          {so.mandateReference}
                        </span>
                        <span className="font-bold text-sm text-navy-900">
                          {so.customerName}
                        </span>
                        <span className="text-xs text-slate-500">
                          • Wallet {so.walletAccountNumber} (Current Bal:{" "}
                          <strong className="text-emerald-700">
                            {formatNgn(so.walletBalance)}
                          </strong>
                          )
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        Rule: <strong>{so.parameterCode}</strong> • Deduction:{" "}
                        <strong className="text-navy-900">
                          {formatNgn(so.installmentAmount)}
                        </strong>{" "}
                        ({so.frequency}) • Progress:{" "}
                        <strong>
                          {so.completedInstallments}/{so.totalInstallments}
                        </strong>{" "}
                        • Loan Status: <strong>{so.loanStatus}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {so.status === "ACTIVE" &&
                      (so.loanStatus === "APPROVED_DISBURSED" ||
                        so.loanStatus === "OVERDUE") ? (
                        <button
                          type="button"
                          disabled={busyAction === "EXECUTE_STANDING_ORDER"}
                          onClick={() =>
                            runPlatformAction(
                              "EXECUTE_STANDING_ORDER",
                              {
                                standingOrderId: so.id,
                                triggeredBy: "SUPER_ADMIN_BACK_OFFICE",
                              },
                              `Standing Order ${so.mandateReference} executed for ${so.customerName}!`
                            )
                          }
                          className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Run Standing Order Wallet Debit (
                          {formatNgn(so.installmentAmount)})
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500 font-semibold px-3 py-1 rounded bg-slate-200">
                          {so.loanStatus === "UNDER_REVIEW"
                            ? "Awaiting Loan Disbursement"
                            : "Completed"}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ADMIN TAB 4: FLUTTERWAVE SMART CARDS & GATEWAY OPERATIONS */}
          {adminTab === "CARD_OPERATIONS" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-extrabold text-navy-900">
                      Issued Virtual & Physical Cards (Flutterwave Gateway)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Monitor all customer Smart Cards, manage physical card
                      dispatch, or freeze compromised cards.
                    </p>
                  </div>
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Gateway: {snapshot?.gatewayStatus?.provider}
                  </span>
                </div>

                <div className="space-y-3">
                  {(snapshot?.admin?.allCards || []).map((c: any) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-navy-900 text-gold-400 text-[10px] font-bold">
                            {c.cardType}
                          </span>
                          <span className="font-mono font-bold text-sm text-navy-900">
                            {c.maskedPan}
                          </span>
                          <span className="text-xs text-slate-600">
                            ({c.cardholderName})
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Flutterwave ID:{" "}
                          <span className="font-mono">
                            {c.flutterwaveCardId}
                          </span>{" "}
                          • Card Balance:{" "}
                          <strong className="text-navy-900">
                            {formatNgn(c.cardBalance)}
                          </strong>{" "}
                          {c.cardType === "PHYSICAL" &&
                            `• Courier Status: ${c.deliveryStatus}`}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {c.cardType === "PHYSICAL" &&
                          c.deliveryStatus !== "DELIVERED" && (
                            <button
                              type="button"
                              onClick={() =>
                                runPlatformAction(
                                  "MANAGE_SMART_CARD",
                                  {
                                    cardId: c.id,
                                    action:
                                      c.deliveryStatus === "PROCESSING"
                                        ? "DISPATCH"
                                        : "DELIVER",
                                  },
                                  `Updated physical card ${c.maskedPan} courier status!`
                                )
                              }
                              className="px-3 py-1.5 rounded-lg bg-gold-500 text-navy-950 font-bold text-xs"
                            >
                              {c.deliveryStatus === "PROCESSING"
                                ? "Mark Dispatched"
                                : "Mark Delivered"}
                            </button>
                          )}

                        <button
                          type="button"
                          onClick={() =>
                            runPlatformAction(
                              "MANAGE_SMART_CARD",
                              {
                                cardId: c.id,
                                action:
                                  c.status === "ACTIVE" ? "FREEZE" : "UNFREEZE",
                              },
                              `Updated card status for ${c.maskedPan}!`
                            )
                          }
                          className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-navy-900"
                        >
                          {c.status === "ACTIVE" ? "Freeze" : "Unfreeze"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ADMIN TAB 5: SYSTEM MASTER LEDGER */}
          {adminTab === "SYSTEM_LEDGER" && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-lg font-extrabold text-navy-900">
                Platform-Wide Double-Entry Wallet & Standing Order Ledger
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase text-[11px]">
                      <th className="py-3 px-3">Reference</th>
                      <th className="py-3 px-3">Customer / Wallet</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Description</th>
                      <th className="py-3 px-3 text-right">Amount</th>
                      <th className="py-3 px-3 text-right">Wallet Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(snapshot?.admin?.allTransactions || []).map((tx: any) => (
                      <tr key={tx.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-mono font-bold text-navy-900">
                          {tx.reference}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-navy-900 block">
                            {tx.customerName}
                          </span>
                          <span className="font-mono text-[10px] text-slate-500">
                            Wallet: {tx.walletAccountNumber}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-[11px]">
                            {tx.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {tx.description}
                        </td>
                        <td
                          className={`py-3 px-3 text-right font-extrabold ${
                            tx.type === "CREDIT"
                              ? "text-emerald-700"
                              : "text-rose-700"
                          }`}
                        >
                          {tx.type === "CREDIT" ? "+" : "-"}
                          {formatNgn(tx.amount)}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-navy-900">
                          {formatNgn(tx.balanceAfter)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      )}

      {/* Footer */}
      <footer className="bg-navy-950 text-slate-400 text-xs py-5 px-4 sm:px-6 border-t border-gold-500/20 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gold-400">
              DB CAPITAL CREDIT AND LOAN
            </span>
            <span>•</span>
            <span>
              Pre-Integration Website, Customer Wallet & Super Admin Back Office
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-4 h-4" /> Double-Entry Wallet Ledger
            </span>
            <span className="flex items-center gap-1 text-gold-300">
              <Clock className="w-4 h-4" /> Automated Standing Orders
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
