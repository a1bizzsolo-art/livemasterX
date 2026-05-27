import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Send, ShieldCheck, Loader2 } from "lucide-react";

const USE_CASES = [
  "Precision Agriculture",
  "Operational Intelligence",
  "Defense / Logistics",
  "Enterprise AI Infrastructure",
  "Research / Other",
];

export default function Waitlist({ api, onJoined, stats }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    organization: "",
    use_case: USE_CASES[0],
    acreage: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Operator handle and channel email are required.");
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${api}/waitlist`, form);
      setSuccess(true);
      toast.success("Signal locked. Ariah will be in touch.");
      onJoined?.();
      setForm({ name: "", email: "", organization: "", use_case: USE_CASES[0], acreage: "" });
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        "Transmission failed. Channel unstable — retry.";
      toast.error(typeof msg === "string" ? msg : "Transmission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="waitlist" className="relative border-b border-slate-800">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-16 lg:py-24 relative">
        <div className="grid lg:grid-cols-12 gap-0 border border-slate-800 bg-[#0c0e12]">
          {/* Left — pitch */}
          <div className="lg:col-span-5 p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-slate-800">
            <div className="flex items-center gap-4">
              <span className="font-mono text-xs text-amber-400">// 07</span>
              <span className="h-px flex-1 bg-slate-800" />
              <span className="text-[10px] uppercase tracking-[0.28em] text-slate-500">WAITLIST</span>
            </div>
            <h2 className="mt-6 font-display text-3xl lg:text-5xl font-black uppercase tracking-tighter">
              Initiate <br />
              <span className="text-amber-400">sequence.</span>
            </h2>
            <p className="mt-5 text-sm text-slate-400 leading-relaxed max-w-md">
              Onboarding is tier-gated. Submit your handle to enter the AQAS clearance queue —
              operators routed first.
            </p>

            <div className="mt-10 space-y-3">
              {[
                ["Tier-IV", `${stats.agents_online.toLocaleString()} agents online`],
                ["Coverage", `${stats.fields_under_watch.toLocaleString()} fields under watch`],
                ["Channel", `Encrypted • ${stats.uptime} uptime`],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center gap-3 border border-slate-800 px-3 py-2.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-[10px] uppercase tracking-[0.22em] text-slate-500 w-20">{k}</span>
                  <span className="text-xs font-mono text-white">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — form / terminal */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3 bg-black/40">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 bg-red-500/80" />
                <span className="h-2 w-2 bg-amber-400/80" />
                <span className="h-2 w-2 bg-emerald-400/80" />
              </div>
              <span className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
                /secure/intake -- ariah-bridge
              </span>
            </div>

            {success ? (
              <SuccessPanel onReset={() => setSuccess(false)} />
            ) : (
              <form
                data-testid="waitlist-form"
                onSubmit={submit}
                className="p-6 lg:p-10 grid grid-cols-1 sm:grid-cols-2 gap-0 border-b border-slate-800"
              >
                <Field
                  label="OPERATOR HANDLE *"
                  testid="wl-name"
                  value={form.name}
                  onChange={set("name")}
                  placeholder="Duane Clevenger"
                  className="sm:col-span-1 sm:border-r border-slate-800"
                />
                <Field
                  label="CHANNEL EMAIL *"
                  testid="wl-email"
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="ops@field.io"
                />
                <Field
                  label="ORGANIZATION"
                  testid="wl-org"
                  value={form.organization}
                  onChange={set("organization")}
                  placeholder="E.I.R Technology"
                  className="sm:col-span-1 sm:border-r border-slate-800 border-t"
                />
                <Field
                  label="ACREAGE / SCALE"
                  testid="wl-acreage"
                  value={form.acreage}
                  onChange={set("acreage")}
                  placeholder="e.g. 12,000 acres"
                  className="border-t"
                />
                <SelectField
                  label="USE CASE"
                  testid="wl-usecase"
                  value={form.use_case}
                  onChange={set("use_case")}
                  options={USE_CASES}
                  className="sm:col-span-2 border-t"
                />

                <div className="sm:col-span-2 border-t border-slate-800 px-1 pt-6">
                  <button
                    data-testid="waitlist-submit"
                    type="submit"
                    disabled={submitting}
                    className="group inline-flex items-center justify-center gap-2 bg-amber-500 px-8 py-4 text-xs font-bold uppercase tracking-[0.22em] text-black hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Transmitting…
                      </>
                    ) : (
                      <>
                        Transmit Signal
                        <Send className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                  <p className="mt-3 text-[10px] font-mono uppercase tracking-[0.22em] text-slate-500">
                    {">"} secured // no spam // tier-gated clearance
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, testid, value, onChange, placeholder, type = "text", className = "" }) {
  return (
    <label className={`block p-5 ${className}`}>
      <div className="text-[10px] uppercase tracking-[0.24em] text-amber-400 mb-2">{label}</div>
      <input
        data-testid={testid}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-transparent border-0 border-b border-slate-700 focus:border-amber-400 outline-none font-mono text-sm text-white py-2 placeholder:text-slate-600 focus:placeholder:text-slate-500 transition-colors"
      />
    </label>
  );
}

function SelectField({ label, testid, value, onChange, options, className = "" }) {
  return (
    <label className={`block p-5 ${className}`}>
      <div className="text-[10px] uppercase tracking-[0.24em] text-amber-400 mb-2">{label}</div>
      <select
        data-testid={testid}
        value={value}
        onChange={onChange}
        className="w-full bg-[#0c0e12] border border-slate-700 focus:border-amber-400 outline-none font-mono text-sm text-white py-2.5 px-3 transition-colors"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-[#0c0e12]">
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function SuccessPanel({ onReset }) {
  return (
    <div data-testid="waitlist-success" className="p-10 lg:p-14">
      <div className="flex items-center gap-3">
        <span className="h-2 w-2 bg-emerald-400 pulse-amber" />
        <span className="text-[10px] uppercase tracking-[0.28em] text-emerald-400">
          SIGNAL CONFIRMED // SEQUENCE INITIATED
        </span>
      </div>
      <h3 className="mt-5 font-display text-3xl font-black uppercase tracking-tighter">
        Welcome to the grid.
      </h3>
      <p className="mt-3 text-sm text-slate-400 max-w-md">
        Your handle is now in the AQAS clearance queue. Ariah will route your onboarding briefing
        within 72 hours via the registered channel.
      </p>
      <pre className="mt-6 text-[12px] font-mono text-slate-300 leading-6 border border-slate-800 bg-[#08090b] p-4">
{`[ok] signal received          :: encrypted
[ok] clearance tier            :: pending review
[ok] dispatch                  :: ariah@onboarding`}<span className="blink">_</span>
      </pre>
      <button
        data-testid="waitlist-reset"
        onClick={onReset}
        className="mt-6 inline-flex items-center gap-2 border border-slate-700 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.24em] hover:border-amber-500 hover:text-amber-400 transition-colors"
      >
        Submit another operator
      </button>
    </div>
  );
}
