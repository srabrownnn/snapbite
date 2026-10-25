'use client';

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ShieldCheck, ArrowRight, CheckCircle2, Lock, Smartphone, RefreshCw, X } from "lucide-react";

function BkashGatewayInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const paymentID = searchParams.get("paymentID") || "";
  const orderId = searchParams.get("orderId") || "";
  const amount = searchParams.get("amount") || "0.00";
  const invoice = searchParams.get("invoice") || "INV_001";
  const callbackURL = searchParams.get("callbackURL") || "";

  // Step 1: Wallet Number, Step 2: OTP, Step 3: PIN, Step 4: Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [walletNumber, setWalletNumber] = useState("01712345678");
  const [otp, setOtp] = useState("123456");
  const [pin, setPin] = useState("12345");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [trxID, setTrxID] = useState("");

  const handleNextFromNumber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletNumber || walletNumber.length < 11) {
      setErrorMsg("Please enter a valid 11-digit bKash wallet number.");
      return;
    }
    setErrorMsg("");
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep(2);
    }, 700);
  };

  const handleNextFromOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setErrorMsg("Please enter the verification code sent to your mobile.");
      return;
    }
    setErrorMsg("");
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep(3);
    }, 700);
  };

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || pin.length < 4) {
      setErrorMsg("Please enter your 5-digit bKash PIN.");
      return;
    }
    setErrorMsg("");
    setIsProcessing(true);

    try {
      const res = await fetch("/api/bkash/execute-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentID, orderId }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.trxID) {
        setTrxID(data.trxID);
        setStep(4);
        setTimeout(() => {
          if (callbackURL) {
            window.location.href = `${callbackURL}&status=success&paymentID=${paymentID}`;
          } else {
            router.back();
          }
        }, 1800);
      } else {
        setErrorMsg(data.error || "Payment execution could not be completed.");
        setIsProcessing(false);
      }
    } catch (err: any) {
      setErrorMsg("Network error contacting bKash Gateway. Please try again.");
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    if (callbackURL) {
      window.location.href = `${callbackURL}&status=cancel`;
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      {/* bKash Payment Gateway Modal Container */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-slide-up">
        {/* bKash Official Brand Banner */}
        <div className="bg-[#E2136E] text-white p-6 relative">
          <button
            onClick={handleCancel}
            className="absolute top-4 right-4 p-1 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            title="Cancel Payment"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white text-[#E2136E] flex items-center justify-center font-black text-2xl shadow-md shrink-0">
              ৳
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none">bKash Payment</h1>
              <p className="text-xs text-pink-100 font-semibold mt-1">
                Merchant Gateway • Secure Checkout
              </p>
            </div>
          </div>

          {/* Invoice & Total Summary */}
          <div className="mt-5 pt-4 border-t border-white/20 flex items-center justify-between text-xs">
            <div>
              <span className="text-pink-200 block text-[10px] font-bold uppercase">Invoice No</span>
              <span className="font-mono font-bold tracking-wider">{invoice}</span>
            </div>
            <div className="text-right">
              <span className="text-pink-200 block text-[10px] font-bold uppercase">Payable Amount</span>
              <span className="text-2xl font-black tracking-tight">৳ {amount}</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
              ⚠️ {errorMsg}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleNextFromNumber} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Your bKash Account Number
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    maxLength={11}
                    value={walletNumber}
                    onChange={(e) => setWalletNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder="e.g. 01712345678"
                    className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-300 rounded-xl text-base font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#E2136E]/40 outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>By confirming, you agree to bKash Terms & Conditions</span>
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-1/3 py-3 rounded-xl border border-slate-300 font-bold text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 py-3 bg-[#E2136E] hover:bg-pink-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-lg shadow-pink-600/30 flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  {isProcessing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>CONFIRM</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleNextFromOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Enter Verification Code (OTP)
                </label>
                <p className="text-xs text-slate-500 mb-2">
                  A 6-digit verification code was sent to <strong className="font-mono text-slate-800">{walletNumber}</strong>
                </p>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="w-full text-center py-3 bg-slate-50 border border-slate-300 rounded-xl text-xl font-mono font-black tracking-widest text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#E2136E]/40 outline-none"
                />
                <span className="text-[11px] text-slate-400 block text-center mt-1">
                  (Demo Mode: OTP auto-filled)
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-3 rounded-xl border border-slate-300 font-bold text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 py-3 bg-[#E2136E] hover:bg-pink-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-lg shadow-pink-600/30 flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  {isProcessing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>VERIFY OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleConfirmPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Enter bKash PIN
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    maxLength={5}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                    placeholder="•••••"
                    className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xl font-mono font-black tracking-widest text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#E2136E]/40 outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1 text-center">
                  Never share your bKash PIN with anyone.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-1/3 py-3 rounded-xl border border-slate-300 font-bold text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 py-3 bg-[#E2136E] hover:bg-pink-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-lg shadow-pink-600/30 flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Confirming with bKash...</span>
                    </span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>CONFIRM PAYMENT</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 4 && (
            <div className="py-6 text-center space-y-3 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-black text-slate-900">Payment Successful!</h2>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Your payment of <strong>৳ {amount}</strong> was confirmed by bKash.
              </p>
              <div className="p-3 bg-pink-50 border border-pink-200 rounded-xl inline-block font-mono text-xs font-bold text-pink-900">
                bKash TrxID: {trxID}
              </div>
              <p className="text-[11px] text-slate-400 pt-2 animate-pulse">
                Redirecting back to your live table dashboard...
              </p>
            </div>
          )}
        </div>

        {/* Footer Security Badges */}
        <div className="bg-slate-50 p-3 border-t border-slate-100 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>256-Bit SSL Encrypted • Official bKash Gateway API</span>
        </div>
      </div>
    </div>
  );
}

export default function BkashGatewayPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="p-8 bg-white rounded-3xl shadow-xl flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-[#E2136E] animate-spin" />
            <span className="font-bold text-slate-800 text-sm">
              Connecting to bKash Gateway...
            </span>
          </div>
        </div>
      }
    >
      <BkashGatewayInner />
    </React.Suspense>
  );
}
