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
  LogIn,
  LogOut,
  UserPlus,
  Users,
  KeyRound,
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
  | "SYSTEM_LEDGER"
  | "TEAM_MEMBERS";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function DBCapitalPlatformPage() {
  const [authUser, setAuthUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<"LOGIN" | "REGISTER">("LOGIN");

  // Login Form State
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");

  // Customer Registration Form State
  const [regFullName, setRegFullName] = useState<string>("");
  const [regEmail, setRegEmail] = useState<string>("");
  const [regPhone, setRegPhone] = useState<string>("+234 803 ");
  const [regPassword, setRegPassword] = useState<string>("");
  const [regAccountType, setRegAccountType] = useState<
    "INDIVIDUAL" | "BUSINESS"
  >("INDIVIDUAL");
  const [regBusinessName, setRegBusinessName] = useState<string>("");
  const [regRcNumber, setRegRcNumber] = useState<string>("");
  const [regBvn, setRegBvn] = useState<string>("22490182734");
  const [regNin, setRegNin] = useState<string>("59182736450");

  // Super Admin Team Member Creation Form State
  const [staffFullName, setStaffFullName] = useState<string>("");
  const [staffEmail, setStaffEmail] = useState<string>("");
  const [staffPhone, setStaffPhone] = useState<string>("+234 802 ");
  const [staffPassword, setStaffPassword] = useState<string>("Staff@123");
  const [staffRole, setStaffRole] = useState<
    "TEAM_MEMBER" | "ADMIN" | "SUPER_ADMIN"
  >("TEAM_MEMBER");
  const [staffDepartment, setStaffDepartment] = useState<string>(
    "Credit & Underwriting Operations"
  );

  const [platformMode, setPlatformMode] = useState<PlatformMode>("WEBSITE");
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
    try {
      const saved = sessionStorage.getItem("dbc_auth_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        setAuthUser(parsed);
        if (parsed.role === "CUSTOMER") {
          setSelectedUserId(parsed.id);
          setPlatformMode("CUSTOMER_PORTAL");
        } else {
          setPlatformMode("BACK_OFFICE");
        }
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    fetchSnapshot(selectedUserId);
  }, [selectedUserId, fetchSnapshot]);

  const isAdminSession =
    authUser &&
    (authUser.role === "SUPER_ADMIN" ||
      authUser.role === "ADMIN" ||
      authUser.role === "TEAM_MEMBER");

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await runPlatformAction(
      "LOGIN",
      { email: loginEmail, password: loginPassword },
      "Signed in successfully!"
    );
    if (res && res.user) {
      setAuthUser(res.user);
      sessionStorage.setItem("dbc_auth_user", JSON.stringify(res.user));
      if (res.user.role === "CUSTOMER") {
        setSelectedUserId(res.user.id);
        setPlatformMode("CUSTOMER_PORTAL");
        setPortalTab("OVERVIEW");
        setBanner({
          type: "success",
          text: `Welcome back, ${res.user.fullName}!`,
        });
      } else {
        setPlatformMode("BACK_OFFICE");
        setAdminTab("REPAYMENT_PARAMS");
        setBanner({
          type: "success",
          text: `Welcome back, ${res.user.fullName} (${res.user.role.replace(
            "_",
            " "
          )})!`,
        });
      }
    }
  }

  async function handleRegisterCustomerSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await runPlatformAction(
      "REGISTER_CUSTOMER",
      {
        fullName: regFullName,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
        accountType: regAccountType,
        businessName: regBusinessName,
        rcNumber: regRcNumber,
        bvn: regBvn,
        nin: regNin,
      },
      "Customer account & Prepaid Wallet created!"
    );
    if (res && res.user) {
      setAuthUser(res.user);
      sessionStorage.setItem("dbc_auth_user", JSON.stringify(res.user));
      setSelectedUserId(res.user.id);
      setPlatformMode("CUSTOMER_PORTAL");
      setPortalTab("OVERVIEW");
      setBanner({
        type: "success",
        text: `Welcome to DB Capital, ${res.user.fullName}! Your Prepaid Wallet (${res.walletAccountNumber}) is active.`,
      });
    }
  }

  function handleLogout() {
    setAuthUser(null);
    sessionStorage.removeItem("dbc_auth_user");
    setPlatformMode("WEBSITE");
    setAuthMode("LOGIN");
    setBanner({
      type: "info",
      text: "You have been signed out and returned to the standalone frontend.",
    });
  }

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
          )}). Applied late fee (+${formatNgn(
            json.result.penaltyApplied
          )}). Please fund your wallet.`,
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
                  Wallets • Credit • Smart Cards
                </span>
              </p>
            </div>
          </div>

          {/* Role-Based Navigation & Session Controls */}
          {!authUser ? (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  setPlatformMode("WEBSITE");
                  setAuthMode("LOGIN");
                  document
                    .getElementById("auth-portal-card")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  authMode === "LOGIN"
                    ? "bg-white/15 text-gold-300 border border-gold-400/40"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </button>
              <button
                onClick={() => {
                  setPlatformMode("WEBSITE");
                  setAuthMode("REGISTER");
                  document
                    .getElementById("auth-portal-card")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-dbc-gold-gradient text-navy-950 text-xs font-extrabold shadow"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Create Account
              </button>
            </div>
          ) : isAdminSession ? (
            <>
              {/* Admin Dashboard: Full Switcher (Back Office + Customer Wallet Inspector + Website) */}
              <div className="flex items-center bg-navy-950/70 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setPlatformMode("BACK_OFFICE")}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    platformMode === "BACK_OFFICE"
                      ? "bg-dbc-gold-gradient text-navy-950 shadow"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  Admin Back Office
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
                  Inspect Customer Wallet
                </button>
                <button
                  onClick={() => setPlatformMode("WEBSITE")}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    platformMode === "WEBSITE"
                      ? "bg-dbc-gold-gradient text-navy-950 shadow"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  Website View
                </button>
              </div>

              {/* Admin Customer Wallet Selector & Sign Out */}
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/15">
                  <span className="text-[10px] text-gold-300 uppercase font-bold">
                    Inspect Wallet:
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
                <div className="hidden lg:flex flex-col items-end bg-gold-500/15 border border-gold-400/30 px-3 py-1 rounded-lg">
                  <span className="text-[10px] uppercase tracking-wider text-gold-300 font-bold">
                    {authUser.role.replace("_", " ")}
                  </span>
                  <span className="text-xs font-extrabold text-white">
                    {authUser.fullName}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 text-rose-200 text-xs font-bold transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            /* Standalone Customer Session Header */
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-navy-950/70 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setPlatformMode("CUSTOMER_PORTAL")}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    platformMode === "CUSTOMER_PORTAL"
                      ? "bg-dbc-gold-gradient text-navy-950 shadow"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  <Wallet className="w-3.5 h-3.5" />
                  My Customer Dashboard
                </button>
                <button
                  onClick={() => setPlatformMode("WEBSITE")}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    platformMode === "WEBSITE"
                      ? "bg-dbc-gold-gradient text-navy-950 shadow"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  Home
                </button>
              </div>

              <div className="hidden sm:flex flex-col items-end bg-gold-500/15 border border-gold-400/30 px-3 py-1 rounded-lg">
                <span className="text-[10px] uppercase tracking-wider text-gold-300">
                  My Wallet Balance
                </span>
                <span className="text-sm font-extrabold text-white">
                  {formatNgn(wallet?.balance)}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 text-rose-200 text-xs font-bold transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
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
      {/* VIEW 1: STANDALONE FRONTEND, CUSTOMER SIGNUP & LOGIN PORTAL           */}
      {/* ===================================================================== */}
      {(platformMode === "WEBSITE" || !authUser) && (
        <main className="flex-1">
          {/* Hero Section with Standalone Login / Customer Registration Portal */}
          <section className="bg-dbc-navy-gradient text-white py-12 px-4 sm:px-6 border-b-4 border-gold-500">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 space-y-5 pt-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 border border-gold-400/40 text-gold-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Your Money. Your Credit. Your Growth.
                </div>
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                  DB CAPITAL SMART{" "}
                  <span className="text-gold-400">FINANCIAL PLATFORM</span>
                </h1>
                <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
                  A unified digital financial platform with one smart card,
                  prepaid wallets, personal loans, and business finance. Fund
                  your wallet from any bank or payment channel, apply for credit
                  disbursed straight to your wallet, and automate repayments via
                  Standing Orders.
                </p>

                {!authUser ? (
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("REGISTER");
                        document
                          .getElementById("auth-portal-card")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="px-5 py-3 rounded-xl bg-dbc-gold-gradient text-navy-950 font-bold text-sm shadow-lg hover:opacity-95 transition flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      Create Account
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("LOGIN");
                        document
                          .getElementById("auth-portal-card")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-sm transition flex items-center gap-2"
                    >
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={() => {
                        setPlatformMode("CUSTOMER_PORTAL");
                        setPortalTab("OVERVIEW");
                      }}
                      className="px-5 py-3 rounded-xl bg-dbc-gold-gradient text-navy-950 font-bold text-sm shadow-lg hover:opacity-95 transition flex items-center gap-2"
                    >
                      {isAdminSession
                        ? "Inspect Customer Wallet Portal"
                        : "Go to My Dashboard"}
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                    {isAdminSession && (
                      <button
                        onClick={() => setPlatformMode("BACK_OFFICE")}
                        className="px-5 py-3 rounded-xl bg-navy-800 hover:bg-navy-700 border border-gold-500/40 text-gold-300 font-semibold text-sm transition"
                      >
                        Return to Admin Back Office
                      </button>
                    )}
                  </div>
                )}

                {/* Smart Card Preview Banner */}
                <div className="pt-4">
                  <div className="rounded-2xl bg-gradient-to-br from-navy-900 via-navy-950 to-black p-5 border border-gold-500/40 shadow-xl max-w-lg relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-widest text-gold-400 font-bold">
                          DB CAPITAL SMART CARD & PREPAID WALLET
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Instant Virtual & Physical Cards • Multi-Channel Wallet
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-dbc-gold-gradient flex items-center justify-center text-navy-950 font-black text-xs">
                        DB
                      </div>
                    </div>
                    <p className="font-mono text-lg tracking-widest text-gold-300 font-bold mb-2">
                      5399 •••• •••• 8492
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-300 border-t border-white/10 pt-2">
                      <span>ONE CARD, MULTIPLE SERVICES</span>
                      <span className="text-gold-400 font-bold">
                        INSTANT WALLET DISBURSEMENT
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Standalone Auth Portal (Sign In / Create Account) */}
              <div className="lg:col-span-5" id="auth-portal-card">
                {!authUser ? (
                  <div className="bg-white text-slate-900 rounded-2xl border-2 border-gold-500/70 shadow-2xl overflow-hidden">
                    {/* Auth Mode Switcher Tabs */}
                    <div className="grid grid-cols-2 bg-navy-950 p-1.5 border-b border-slate-200">
                      <button
                        type="button"
                        onClick={() => setAuthMode("LOGIN")}
                        className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition ${
                          authMode === "LOGIN"
                            ? "bg-dbc-gold-gradient text-navy-950 shadow"
                            : "text-slate-300 hover:text-white"
                        }`}
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        Sign In
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuthMode("REGISTER")}
                        className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition ${
                          authMode === "REGISTER"
                            ? "bg-dbc-gold-gradient text-navy-950 shadow"
                            : "text-slate-300 hover:text-white"
                        }`}
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Create Account
                      </button>
                    </div>

                    {authMode === "LOGIN" ? (
                      <form
                        onSubmit={handleLoginSubmit}
                        className="p-6 space-y-4"
                      >
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-gold-600">
                            DB Capital Online Banking
                          </span>
                          <h2 className="text-lg font-extrabold text-navy-900">
                            Sign In to Your Account
                          </h2>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Enter your email address and password to access your
                            DB Capital account.
                          </p>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Email Address
                            </label>
                            <input
                              type="email"
                              required
                              value={loginEmail}
                              onChange={(e) => setLoginEmail(e.target.value)}
                              placeholder="you@example.com"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-navy-900 focus:outline-none focus:border-navy-900"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Password
                            </label>
                            <input
                              type="password"
                              required
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-navy-900 focus:outline-none focus:border-navy-900"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={busyAction === "LOGIN"}
                          className="w-full py-3 rounded-xl bg-dbc-navy-gradient text-gold-400 font-extrabold text-xs shadow-lg hover:opacity-95 transition flex items-center justify-center gap-2"
                        >
                          <LogIn className="w-4 h-4" />
                          {busyAction === "LOGIN"
                            ? "Signing In..."
                            : "Sign In to Account"}
                        </button>

                        <p className="text-center text-xs text-slate-500 pt-1">
                          New to DB Capital?{" "}
                          <button
                            type="button"
                            onClick={() => setAuthMode("REGISTER")}
                            className="font-bold text-navy-900 hover:text-gold-600 underline"
                          >
                            Create an account
                          </button>
                        </p>
                      </form>
                    ) : (
                      <form
                        onSubmit={handleRegisterCustomerSubmit}
                        className="p-6 space-y-3.5"
                      >
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-gold-600">
                            Instant Account & Prepaid Wallet
                          </span>
                          <h2 className="text-lg font-extrabold text-navy-900">
                            Create Your Account
                          </h2>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Open your dedicated NGN Prepaid Wallet for personal
                            loans, business finance, and Smart Cards.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {(["INDIVIDUAL", "BUSINESS"] as const).map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setRegAccountType(type)}
                              className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                                regAccountType === type
                                  ? "bg-navy-900 text-gold-400 border-navy-900"
                                  : "bg-slate-50 text-slate-600 border-slate-200"
                              }`}
                            >
                              {type === "INDIVIDUAL"
                                ? "Individual Account"
                                : "Business / SME Account"}
                            </button>
                          ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">
                              Full Name *
                            </label>
                            <input
                              type="text"
                              required
                              value={regFullName}
                              onChange={(e) => setRegFullName(e.target.value)}
                              placeholder="e.g. Chinedu Eze"
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-semibold text-navy-900"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">
                              Phone Number *
                            </label>
                            <input
                              type="tel"
                              required
                              value={regPhone}
                              onChange={(e) => setRegPhone(e.target.value)}
                              placeholder="+234 803 000 0000"
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-semibold text-navy-900"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">
                              Email Address *
                            </label>
                            <input
                              type="email"
                              required
                              value={regEmail}
                              onChange={(e) => setRegEmail(e.target.value)}
                              placeholder="you@domain.com"
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-semibold text-navy-900"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">
                              Password *
                            </label>
                            <input
                              type="password"
                              required
                              value={regPassword}
                              onChange={(e) => setRegPassword(e.target.value)}
                              placeholder="Min 6 characters"
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-semibold text-navy-900"
                            />
                          </div>
                        </div>

                        {regAccountType === "BUSINESS" && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                            <div>
                              <label className="font-bold text-slate-700 block mb-1">
                                Registered Business Name *
                              </label>
                              <input
                                type="text"
                                required
                                value={regBusinessName}
                                onChange={(e) =>
                                  setRegBusinessName(e.target.value)
                                }
                                placeholder="e.g. Zenith Logistics Ltd"
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-semibold text-navy-900"
                              />
                            </div>
                            <div>
                              <label className="font-bold text-slate-700 block mb-1">
                                CAC RC Number
                              </label>
                              <input
                                type="text"
                                value={regRcNumber}
                                onChange={(e) => setRegRcNumber(e.target.value)}
                                placeholder="RC-1928374"
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-navy-900"
                              />
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2.5 text-xs">
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">
                              11-Digit BVN (KYC)
                            </label>
                            <input
                              type="text"
                              maxLength={11}
                              value={regBvn}
                              onChange={(e) => setRegBvn(e.target.value)}
                              placeholder="22345678901"
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-navy-900"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">
                              11-Digit NIN (KYC)
                            </label>
                            <input
                              type="text"
                              maxLength={11}
                              value={regNin}
                              onChange={(e) => setRegNin(e.target.value)}
                              placeholder="55443322110"
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-navy-900"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={busyAction === "REGISTER_CUSTOMER"}
                          className="w-full py-3 rounded-xl bg-dbc-gold-gradient text-navy-950 font-extrabold text-xs shadow-lg hover:opacity-95 transition flex items-center justify-center gap-2"
                        >
                          <UserPlus className="w-4 h-4" />
                          {busyAction === "REGISTER_CUSTOMER"
                            ? "Creating Account & Prepaid Wallet..."
                            : "Create Account & Open Dashboard"}
                        </button>
                      </form>
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl bg-gradient-to-br from-navy-900 via-navy-950 to-black p-6 border-2 border-gold-500/60 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                        Signed In
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {authUser.email}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-white">
                      Welcome back, {authUser.fullName}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Access your Prepaid Wallet, Loan & Credit facilities,
                      automated Standing Orders, and Virtual or Physical Smart
                      Cards.
                    </p>
                    <div className="flex flex-col gap-2 pt-2">
                      {isAdminSession ? (
                        <>
                          <button
                            onClick={() => setPlatformMode("BACK_OFFICE")}
                            className="w-full py-3 rounded-xl bg-dbc-gold-gradient text-navy-950 font-extrabold text-xs shadow"
                          >
                            Open Admin Back Office →
                          </button>
                          <button
                            onClick={() => setPlatformMode("CUSTOMER_PORTAL")}
                            className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/20"
                          >
                            Inspect Customer Wallets →
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setPlatformMode("CUSTOMER_PORTAL")}
                          className="w-full py-3 rounded-xl bg-dbc-gold-gradient text-navy-950 font-extrabold text-xs shadow"
                        >
                          Open My Dashboard →
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Core Products & Financial Solutions */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
            <div>
              <h2 className="text-xl font-extrabold text-navy-900 mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-gold-600" />
                Core Products & Financial Services
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
                      Fund your dedicated DB Capital wallet seamlessly via Bank
                      Transfer, Debit Card, or USSD from any bank or payment
                      platform. Serves as your hub for credit disbursements and
                      payments.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (!authUser) {
                        setAuthMode("REGISTER");
                        document
                          .getElementById("auth-portal-card")
                          ?.scrollIntoView({ behavior: "smooth" });
                        return;
                      }
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
                      <strong>disbursed directly into your wallet</strong> and
                      repaid automatically via your scheduled Standing Order.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (!authUser) {
                        setAuthMode("REGISTER");
                        document
                          .getElementById("auth-portal-card")
                          ?.scrollIntoView({ behavior: "smooth" });
                        return;
                      }
                      setPlatformMode("CUSTOMER_PORTAL");
                      setPortalTab("LOANS_AND_CREDIT");
                    }}
                    className="mt-4 text-xs font-bold text-navy-800 hover:text-gold-600 flex items-center gap-1"
                  >
                    Apply for Credit <ArrowUpRight className="w-3.5 h-3.5" />
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
                      Working capital and asset financing tailored for growing
                      businesses, paired with transparent repayment schedules
                      and automated wallet Standing Orders.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (!authUser) {
                        setAuthMode("REGISTER");
                        document
                          .getElementById("auth-portal-card")
                          ?.scrollIntoView({ behavior: "smooth" });
                        return;
                      }
                      setPlatformMode("CUSTOMER_PORTAL");
                      setPortalTab("STANDING_ORDERS");
                    }}
                    className="mt-4 text-xs font-bold text-navy-800 hover:text-gold-600 flex items-center gap-1"
                  >
                    Set Up Standing Order <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-gold-500 transition flex flex-col justify-between">
                  <div>
                    <div className="w-11 h-11 rounded-xl bg-navy-900 text-gold-400 flex items-center justify-center mb-4">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-navy-900 text-base">
                      4. Smart Cards (Virtual & Physical)
                    </h3>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      One card, multiple services. Request instant Virtual or
                      Physical Smart Cards linked directly to your DB Capital
                      wallet for seamless online and in-store payments.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (!authUser) {
                        setAuthMode("REGISTER");
                        document
                          .getElementById("auth-portal-card")
                          ?.scrollIntoView({ behavior: "smooth" });
                        return;
                      }
                      setPlatformMode("CUSTOMER_PORTAL");
                      setPortalTab("SMART_CARDS");
                    }}
                    className="mt-4 text-xs font-bold text-navy-800 hover:text-gold-600 flex items-center gap-1"
                  >
                    Request Smart Card <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* ===================================================================== */}
      {/* VIEW 2: CUSTOMER WALLET, LOANS, STANDING ORDERS & SMART CARDS PORTAL  */}
      {/* ===================================================================== */}
      {authUser && platformMode === "CUSTOMER_PORTAL" && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Admin Customer Wallet Inspector Banner (Visible only to Super Admin / Team Members) */}
          {isAdminSession && (
            <div className="bg-navy-900 text-white rounded-2xl p-4 border border-gold-500/40 shadow-md flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-full bg-gold-500 text-navy-950 font-black text-[10px] uppercase">
                  Admin Customer Wallet Inspector
                </span>
                <p className="text-xs text-slate-300">
                  Signed in as{" "}
                  <strong className="text-gold-300">{authUser.fullName}</strong>{" "}
                  ({authUser.role}). Inspecting{" "}
                  <strong className="text-white">
                    {currentUser?.fullName}&apos;s
                  </strong>{" "}
                  wallet & credit profile.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedUserId}
                  onChange={(e) => {
                    const nextId = e.target.value;
                    setSelectedUserId(nextId);
                    fetchSnapshot(nextId);
                  }}
                  className="bg-navy-950 text-gold-300 text-xs font-bold px-3 py-1.5 rounded-lg border border-gold-500/40 focus:outline-none"
                >
                  {(snapshot?.users || []).map((u: any) => (
                    <option key={u.id} value={u.id}>
                      Switch Customer: {u.fullName} ({u.accountType})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setPlatformMode("BACK_OFFICE")}
                  className="px-3 py-1.5 rounded-lg bg-dbc-gold-gradient text-navy-950 font-extrabold text-xs"
                >
                  ← Back to Admin Back Office
                </button>
              </div>
            </div>
          )}

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
                <Plus className="w-4 h-4" /> Fund Prepaid Wallet
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
                  DB Capital Smart Cards
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
                      Multi-Channel Wallet Funding
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
                      Payment Method (Any Bank or Payment Platform)
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
                      • Fund from any bank app, debit card, USSD, or payment
                      platform into your DB Capital Prepaid Wallet.
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
                        )} (${fundChannel.replace("_", " ")})!`
                      );
                      if (res) setShowFundModal(false);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-dbc-gold-gradient text-navy-950 font-extrabold text-xs shadow hover:opacity-95"
                  >
                    {busyAction === "FUND_WALLET"
                      ? "Processing Payment..."
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
                        Approved loans are disbursed directly to your wallet and
                        repaid automatically via your scheduled Standing Orders.
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
                              {loan.reference} • Plan: {loan.parameterCode}
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
                                Pay Next Installment Now
                              </button>
                            ) : loan.status === "UNDER_REVIEW" ? (
                              isAdminSession ? (
                                <button
                                  onClick={() => {
                                    setPlatformMode("BACK_OFFICE");
                                    setAdminTab("LOAN_DISBURSEMENTS");
                                  }}
                                  className="text-xs font-bold text-gold-600 underline"
                                >
                                  Approve & Disburse in Back Office →
                                </button>
                              ) : (
                                <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                                  Under Credit Review • Pending Wallet Disbursement
                                </span>
                              )
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
                    Wallet-Disbursed Credit Facility
                  </span>
                  <h3 className="text-xl font-extrabold text-navy-900">
                    Apply for Loan / Credit & Authorize Wallet Standing Order
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Select a credit plan below. Approved funds are disbursed
                    directly into your DB Capital Prepaid Wallet and repaid via
                    automated Standing Orders.
                  </p>
                </div>

                {/* Product Parameter Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    1. Select Credit / Loan Product
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
                      Plan: {selectedParam?.code}
                    </span>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    By authorizing this Standing Order, your DB Capital Prepaid
                    Wallet (<strong>{wallet?.accountNumber}</strong>) will be
                    automatically debited{" "}
                    <strong>{formatNgn(previewInstallment)}</strong> every{" "}
                    <strong>{selectedParam?.repaymentFrequency}</strong> for{" "}
                    <strong>{previewTenure} installments</strong>. This facility
                    requires a{" "}
                    <strong>
                      {selectedParam?.minWalletReservePercent}% wallet reserve (
                      {formatNgn(previewMinWalletReserve)})
                    </strong>{" "}
                    and applies a{" "}
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
                      })!`
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

              {/* Right Column: Live Amortization & Repayment Plan Summary */}
              <div className="lg:col-span-5 space-y-5">
                <div className="bg-dbc-navy-gradient text-white rounded-2xl p-6 border border-gold-500/40 shadow-lg space-y-4">
                  <div className="flex items-center justify-between border-b border-white/15 pb-3">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-gold-400 font-bold">
                        Repayment Plan Summary
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
                            Deduction Schedule:{" "}
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
                                Pay Next Installment Now
                              </button>
                            )}
                        </div>
                      </div>

                      {/* Execution History */}
                      <div className="bg-white rounded-xl p-3.5 border border-slate-200">
                        <p className="text-xs font-bold text-navy-900 mb-2">
                          Standing Order Execution History
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

          {/* TAB 4: VIRTUAL & PHYSICAL SMART CARDS */}
          {portalTab === "SMART_CARDS" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Customer's Existing Cards */}
              <div className="lg:col-span-7 space-y-5">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-gold-600">
                        DB Capital Card Services
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
                                Spending Limit:{" "}
                                <strong className="text-navy-900">
                                  {formatNgn(card.spendingLimit)}
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
                                    `Smart Card ${card.maskedPan} status updated!`
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
                                    )} from Prepaid Wallet to Smart Card ${
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
                      Instant Card Issuance
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
                        `Issued new ${cardType} ${cardBrand} Smart Card and funded ${formatNgn(
                          cardInitialFund
                        )} from your wallet!`
                      )
                    }
                    className="w-full py-3 rounded-xl bg-dbc-gold-gradient text-navy-950 font-extrabold text-xs shadow-md hover:opacity-95 transition"
                  >
                    {busyAction === "ISSUE_SMART_CARD"
                      ? "Issuing Smart Card..."
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
                    Prepaid Wallet Statement ({wallet?.accountNumber})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Complete statement of wallet funding, loan disbursements,
                    standing order repayments, and card transactions.
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
                      <th className="py-3 px-3">Date</th>
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
                          {new Date(tx.createdAt).toLocaleDateString()}
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
      {authUser && isAdminSession && platformMode === "BACK_OFFICE" && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Admin Header & Navigation */}
          <div className="bg-dbc-navy-gradient text-white rounded-2xl p-5 border border-gold-500/40 shadow-lg flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-gold-500 text-navy-950 font-black text-[10px] uppercase">
                  {authUser.role === "SUPER_ADMIN"
                    ? "Super Admin Back Office"
                    : "Admin & Team Operations Back Office"}
                </span>
                <span className="text-xs text-gold-300 font-semibold">
                  Operate • Monitor • Report • Inspect Customer Wallets
                </span>
              </div>
              <h2 className="text-xl font-extrabold mt-1">
                Credit Parameters, Wallet Disbursements, Standing Orders & Team
                Accounts
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
                {
                  id: "TEAM_MEMBERS",
                  label: "6. Team & Staff Accounts",
                  icon: Users,
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

          {/* ADMIN TAB 6: SUPER ADMIN TEAM MEMBER MANAGEMENT & CUSTOMER WALLET SHORTCUTS */}
          {adminTab === "TEAM_MEMBERS" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Existing Team Members & Customer Wallet Inspector Directory */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-extrabold text-navy-900">
                        Admin & Team Member Directory
                      </h3>
                      <p className="text-xs text-slate-500">
                        All staff accounts below can sign in on the standalone
                        frontend to access the Admin Dashboard and inspect
                        customer wallets.
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-navy-900 text-gold-400 font-bold text-xs">
                      {(snapshot?.admin?.teamMembers || []).length} Active Staff
                    </span>
                  </div>

                  <div className="space-y-3">
                    {(snapshot?.admin?.teamMembers || []).map((member: any) => (
                      <div
                        key={member.id}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-navy-900 text-gold-400 font-black text-sm flex items-center justify-center">
                            {member.fullName?.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-navy-900">
                                {member.fullName}
                              </h4>
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                                  member.role === "SUPER_ADMIN"
                                    ? "bg-gold-500 text-navy-950"
                                    : member.role === "ADMIN"
                                    ? "bg-navy-900 text-gold-400"
                                    : "bg-emerald-100 text-emerald-800"
                                }`}
                              >
                                {member.role.replace("_", " ")}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">
                              {member.email} • {member.phone}
                            </p>
                            {member.department && (
                              <p className="text-[11px] text-slate-600 font-semibold mt-0.5">
                                Department: {member.department}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                          Admin Portal Enabled
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Customer Wallet Inspector List */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-base font-extrabold text-navy-900">
                      Customer Wallet Inspector Directory
                    </h3>
                    <p className="text-xs text-slate-500">
                      Select any registered customer below to open and inspect
                      their Prepaid Wallet, Loan Applications, Standing Orders,
                      and Smart Cards.
                    </p>
                  </div>
                  <div className="space-y-2.5">
                    {(snapshot?.users || []).map((cust: any) => (
                      <div
                        key={cust.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-navy-900">
                              {cust.fullName}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                              {cust.accountType}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-mono">
                            {cust.email} • {cust.phone}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUserId(cust.id);
                            fetchSnapshot(cust.id);
                            setPlatformMode("CUSTOMER_PORTAL");
                            setPortalTab("OVERVIEW");
                          }}
                          className="px-3.5 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-gold-400 font-bold text-xs flex items-center gap-1.5"
                        >
                          <Wallet className="w-3.5 h-3.5" />
                          Inspect Customer Wallet →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Super Admin Create Team Member Account Form */}
              <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 h-fit">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gold-600">
                    Super Admin Access Control
                  </span>
                  <h3 className="text-lg font-extrabold text-navy-900">
                    Create Account for Team Member
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Provision login credentials for team members (`TEAM_MEMBER`,
                    `ADMIN`, or `SUPER_ADMIN`). They can log in directly on the
                    frontend to access the Admin Dashboard.
                  </p>
                </div>

                {authUser.role !== "SUPER_ADMIN" &&
                authUser.role !== "ADMIN" ? (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
                    <p className="font-bold">
                      Super Admin Permission Required
                    </p>
                    <p>
                      You are currently signed in as a{" "}
                      <strong>{authUser.role}</strong>. Only a{" "}
                      <strong>SUPER_ADMIN</strong> or <strong>ADMIN</strong> can
                      provision new team member accounts.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Team Member Full Name *
                      </label>
                      <input
                        type="text"
                        value={staffFullName}
                        onChange={(e) => setStaffFullName(e.target.value)}
                        placeholder="e.g. Segun Obasanjo"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-semibold text-navy-900"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          Official Email Address *
                        </label>
                        <input
                          type="email"
                          value={staffEmail}
                          onChange={(e) => setStaffEmail(e.target.value)}
                          placeholder="segun@dbcapital.ng"
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-semibold text-navy-900"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={staffPhone}
                          onChange={(e) => setStaffPhone(e.target.value)}
                          placeholder="+234 809 000 0000"
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-semibold text-navy-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          Assigned Role *
                        </label>
                        <select
                          value={staffRole}
                          onChange={(e) =>
                            setStaffRole(
                              e.target.value as
                                | "TEAM_MEMBER"
                                | "ADMIN"
                                | "SUPER_ADMIN"
                            )
                          }
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-navy-900"
                        >
                          <option value="TEAM_MEMBER">
                            TEAM_MEMBER (Operations)
                          </option>
                          <option value="ADMIN">ADMIN (Manager)</option>
                          <option value="SUPER_ADMIN">
                            SUPER_ADMIN (Executive)
                          </option>
                        </select>
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          Department / Unit *
                        </label>
                        <input
                          type="text"
                          value={staffDepartment}
                          onChange={(e) => setStaffDepartment(e.target.value)}
                          placeholder="Credit & Risk Operations"
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-semibold text-navy-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Temporary Login Password *
                      </label>
                      <input
                        type="text"
                        value={staffPassword}
                        onChange={(e) => setStaffPassword(e.target.value)}
                        placeholder="Staff@123"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-navy-900"
                      />
                    </div>

                    <button
                      type="button"
                      disabled={busyAction === "CREATE_TEAM_MEMBER"}
                      onClick={async () => {
                        const res = await runPlatformAction(
                          "CREATE_TEAM_MEMBER",
                          {
                            creatorUserId: authUser.id,
                            fullName: staffFullName,
                            email: staffEmail,
                            phone: staffPhone,
                            password: staffPassword,
                            role: staffRole,
                            department: staffDepartment,
                          },
                          `Created ${staffRole} account for ${staffFullName} (${staffEmail})! They can now log in on the frontend.`
                        );
                        if (res) {
                          setStaffFullName("");
                          setStaffEmail("");
                          setStaffPhone("");
                        }
                      }}
                      className="w-full py-3 rounded-xl bg-dbc-gold-gradient text-navy-950 font-extrabold text-xs shadow-lg hover:opacity-95 transition flex items-center justify-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      {busyAction === "CREATE_TEAM_MEMBER"
                        ? "Creating Team Member Account..."
                        : "Create Team Member Account"}
                    </button>
                  </div>
                )}
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
              Prepaid Wallets • Personal & Business Credit • Smart Cards
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-4 h-4" /> Secure Digital Wallet
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
