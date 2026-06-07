import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { XCircle, ArrowLeft } from "lucide-react";

export default function PaymentCancel() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white grid-bg flex items-center justify-center px-6">
      <div data-testid="payment-cancel-card" className="w-full max-w-xl border border-slate-800 bg-[#0c0e12]">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-black/40">
          <span className="text-[10px] uppercase tracking-[0.24em] text-slate-500">/secure/payment/abort</span>
          <span className="text-[10px] font-mono text-red-400">CANCELLED</span>
        </div>
        <div className="p-8 lg:p-10">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-400" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-red-400">CANCELLED</span>
          </div>
          <h1 className="mt-4 font-display text-3xl font-black uppercase tracking-tighter">
            Sequence aborted.
          </h1>
          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            No charge made. You can return and pick a tier whenever you're ready.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              data-testid="cancel-back"
              onClick={() => navigate("/")}
              className="inline-flex items-center justify-center gap-2 border border-slate-700 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.22em] hover:border-amber-500 hover:text-amber-400 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to base
            </button>
            <Link
              to="/#pricing"
              className="inline-flex items-center justify-center gap-2 bg-amber-500 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-black hover:bg-amber-400 transition-colors"
            >
              Try again
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
