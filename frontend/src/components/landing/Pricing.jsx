import React, { useEffect, useState } from "react";
import axios from "axios";
import { Check, ArrowRight, Loader2 } from "lucide-react";

export default function Pricing({ api }) {
  const [tiers, setTiers] = useState([]);
  const [mode, setMode] = useState("sandbox");
  const [stats, setStats] = useState({ count: 0, revenue: 0, currency: "USD", recent: [] });
  const [submitting, setSubmitting] = useState(null);
  const [emailDraft, setEmailDraft] = useState("");

  useEffect(() => {
    axios.get(`${api}/pricing`).then((r) => {
      setTiers(r.data.tiers || []);
      setMode(r.data.mode || "sandbox");
    }).catch(() => {});
    axios.get(`${api}/deals/stats`).then((r) => setStats(r.data)).catch(() => {});
  }, [api]);

  const handleCheckout = async (tierId) => {
    if (submitting) return;
    setSubmitting(tierId);
    try {
      const origin = window.location.origin;
      const payload = { tier: tierId, origin_url: origin };
      if (emailDraft.trim()) payload.customer_email = emailDraft.trim();
      const r = await axios.post(`${api}/checkout/session`, payload);
      if (r.data?.url) {
        window.location.href = r.data.url;
      }
    } catch (e) {
      console.error("Checkout failed", e);
      setSubmitting(null);
    }
  };

  return (
    <section id="pricing" className="relative border-b border-slate-800">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-16 lg:py-24">
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-amber-400">// 06</span>
          <span className="h-px flex-1 bg-slate-800" />
          <span className="text-[10px] uppercase tracking-[0.28em] text-slate-500">
            PRICING // PAY THE OPERATOR
          </span>
        </div>
        <div className="mt-4 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter max-w-3xl">
            Three tiers. <span className="text-amber-400">One outcome.</span>
          </h2>

          {/* Live revenue counter */}
          <div data-testid="revenue-counter" className="border border-slate-800 bg-[#0c0e12] min-w-[260px]">
            <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.24em] text-slate-500">
                Closed Deals // Live
              </span>
              <span className="h-1.5 w-1.5 bg-emerald-400 blink" />
            </div>
            <div className="grid grid-cols-2 divide-x divide-slate-800">
              <div className="px-4 py-3">
                <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Revenue</div>
                <div className="font-display text-2xl font-black text-amber-400">
                  ${stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
              </div>
              <div className="px-4 py-3">
                <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Deals</div>
                <div className="font-display text-2xl font-black text-white">{stats.count}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Optional email capture before checkout */}
        <div className="mt-10 border border-slate-800 bg-[#0c0e12] grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-7 px-5 py-4 border-b lg:border-b-0 lg:border-r border-slate-800">
            <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500 mb-2">
              CONTACT EMAIL (optional, attaches to your deal record)
            </div>
            <input
              data-testid="pricing-email"
              type="email"
              value={emailDraft}
              onChange={(e) => setEmailDraft(e.target.value)}
              placeholder="ops@field.io"
              className="w-full bg-transparent border-0 border-b border-slate-700 focus:border-amber-400 outline-none font-mono text-sm text-white py-2 placeholder:text-slate-600"
            />
          </div>
          <div className="lg:col-span-5 px-5 py-4 flex items-center justify-between">
            <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
              {mode === "live"
                ? "LIVE PAYMENTS // real cards charged"
                : "Test mode active — use card 4242 4242 4242 4242"}
            </div>
            <div className={`text-[10px] font-mono ${mode === "live" ? "text-red-400" : "text-emerald-400"}`}>
              {mode.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Tier cards */}
        <div className="mt-0 grid lg:grid-cols-3 border border-t-0 border-slate-800">
          {tiers.map((t, i) => {
            const featured = t.id === "pro";
            return (
              <div
                key={t.id}
                data-testid={`tier-${t.id}`}
                className={`relative p-8 border-b lg:border-b-0 ${i < tiers.length - 1 ? "lg:border-r" : ""} border-slate-800 ${
                  featured ? "bg-amber-500/[0.04]" : ""
                }`}
              >
                {featured && (
                  <div className="absolute top-0 right-0 bg-amber-500 text-black text-[9px] font-bold uppercase tracking-[0.22em] px-3 py-1">
                    Recommended
                  </div>
                )}

                <div className="text-[10px] uppercase tracking-[0.24em] text-amber-400">{t.name}</div>
                <h3 className="mt-2 font-display text-xl font-bold uppercase tracking-tight">{t.tagline}</h3>

                <div className="mt-6 flex items-baseline gap-2">
                  <span className="font-display text-5xl font-black tracking-tighter text-white">
                    ${t.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-500">/ mo</span>
                </div>

                <ul className="mt-8 space-y-3">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-slate-300">
                      <Check className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  data-testid={`checkout-${t.id}`}
                  onClick={() => handleCheckout(t.id)}
                  disabled={!!submitting}
                  className={`mt-8 group inline-flex items-center justify-center gap-2 w-full px-5 py-4 text-xs font-bold uppercase tracking-[0.22em] transition-colors disabled:opacity-60 ${
                    featured
                      ? "bg-amber-500 text-black hover:bg-amber-400"
                      : "border border-slate-700 text-white hover:border-amber-500 hover:text-amber-400"
                  }`}
                >
                  {submitting === t.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Routing to Stripe…
                    </>
                  ) : (
                    <>
                      Activate {t.name}
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Recent deals tape */}
        {stats.recent && stats.recent.length > 0 && (
          <div className="mt-10 border border-slate-800">
            <div className="px-5 py-3 border-b border-slate-800 bg-black/40 text-[10px] uppercase tracking-[0.24em] text-slate-500">
              // Last closed deals
            </div>
            <div className="divide-y divide-slate-800">
              {stats.recent.map((d) => (
                <div key={d.id} className="grid grid-cols-12 px-5 py-3 text-xs font-mono items-center">
                  <div className="col-span-3 text-amber-400">${Number(d.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                  <div className="col-span-3 text-white uppercase">{d.tier_name}</div>
                  <div className="col-span-4 text-slate-400 truncate">{d.customer_email || d.customer_name || "anonymous"}</div>
                  <div className="col-span-2 text-right text-slate-500">{new Date(d.closed_at).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
