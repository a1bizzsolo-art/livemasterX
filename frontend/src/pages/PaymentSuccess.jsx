import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, Loader2, AlertCircle, ArrowLeft } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [state, setState] = useState({ phase: "checking", data: null, error: null });
  const attemptsRef = useRef(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionId) {
      setState({ phase: "error", data: null, error: "Missing session id." });
      return;
    }

    let cancelled = false;
    const poll = async () => {
      if (cancelled) return;
      attemptsRef.current += 1;
      try {
        const r = await axios.get(`${API}/checkout/status/${sessionId}`);
        if (cancelled) return;
        if (r.data.payment_status === "paid") {
          setState({ phase: "paid", data: r.data, error: null });
          return;
        }
        if (r.data.status === "expired") {
          setState({ phase: "expired", data: r.data, error: "Session expired." });
          return;
        }
        if (attemptsRef.current >= 6) {
          setState({ phase: "pending", data: r.data, error: null });
          return;
        }
        setTimeout(poll, 2000);
      } catch (e) {
        if (cancelled) return;
        setState({ phase: "error", data: null, error: e?.response?.data?.detail || "Could not verify payment." });
      }
    };
    poll();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white grid-bg flex items-center justify-center px-6">
      <div data-testid="payment-success-card" className="w-full max-w-xl border border-slate-800 bg-[#0c0e12]">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-black/40">
          <span className="text-[10px] uppercase tracking-[0.24em] text-slate-500">
            /secure/payment/confirm
          </span>
          <span className="text-[10px] font-mono text-emerald-400">SANDBOX</span>
        </div>

        <div className="p-8 lg:p-10">
          {state.phase === "checking" && (
            <Status
              icon={<Loader2 className="h-5 w-5 text-amber-400 animate-spin" />}
              tone="text-amber-400"
              label="VERIFYING"
              title="Confirming with Stripe…"
              body="Standby — we're polling the orbital payment grid."
            />
          )}
          {state.phase === "pending" && (
            <Status
              icon={<Loader2 className="h-5 w-5 text-amber-400 animate-spin" />}
              tone="text-amber-400"
              label="PENDING"
              title="Payment still processing"
              body="Stripe is finalizing. You can leave this page — your Gmail will be notified the moment it clears."
            />
          )}
          {state.phase === "paid" && (
            <>
              <Status
                icon={<CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                tone="text-emerald-400"
                label="PAID"
                title={`${state.data.tier_name} activated.`}
                body="Deal closed. Funds routed to the operator account. A notification has been dispatched to Gmail."
              />
              <div className="mt-6 grid grid-cols-2 border border-slate-800">
                <Cell k="Amount" v={`$${Number(state.data.amount).toFixed(2)} ${state.data.currency?.toUpperCase()}`} />
                <Cell k="Tier" v={state.data.tier_name} />
              </div>
            </>
          )}
          {(state.phase === "expired" || state.phase === "error") && (
            <Status
              icon={<AlertCircle className="h-5 w-5 text-red-400" />}
              tone="text-red-400"
              label={state.phase.toUpperCase()}
              title="Payment not completed"
              body={state.error || "Something blocked the transaction. Try again."}
            />
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              data-testid="back-home"
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
              View tiers
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Status({ icon, tone, label, title, body }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        {icon}
        <span className={`text-[10px] uppercase tracking-[0.28em] ${tone}`}>{label}</span>
      </div>
      <h1 className="mt-4 font-display text-3xl font-black uppercase tracking-tighter">{title}</h1>
      <p className="mt-3 text-sm text-slate-400 leading-relaxed">{body}</p>
    </div>
  );
}

function Cell({ k, v }) {
  return (
    <div className="px-4 py-3 border-r last:border-r-0 border-slate-800">
      <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">{k}</div>
      <div className="font-mono text-sm text-white mt-1">{v}</div>
    </div>
  );
}
