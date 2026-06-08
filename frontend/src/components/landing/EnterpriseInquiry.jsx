import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { ShieldCheck, Loader2, Send } from "lucide-react";

export default function EnterpriseInquiry({ api, acres, onSubmitted }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    organization: "",
    timeline: "1–3 months",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!form.name.trim() || !form.email.trim() || !form.organization.trim()) {
      toast.error("Operator handle, channel email and organization are required.");
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${api}/enterprise/inquiry`, {
        ...form,
        acres: Math.max(50001, Math.floor(acres)),
      });
      toast.success("Inquiry locked. Ops will route within 24h.");
      setSubmitted(true);
      onSubmitted?.();
    } catch (err) {
      const msg = err?.response?.data?.detail || "Transmission failed. Retry.";
      toast.error(typeof msg === "string" ? msg : "Transmission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div data-testid="enterprise-success" className="border border-emerald-500/40 bg-emerald-500/[0.04] p-7">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-emerald-400">
          <ShieldCheck className="h-4 w-4" />
          INQUIRY RECEIVED
        </div>
        <h3 className="mt-4 font-display text-2xl font-black uppercase tracking-tighter">
          Routing to ops.
        </h3>
        <p className="mt-2 text-sm text-slate-400">
          A dedicated operator will contact you within 24 hours to scope the deployment
          and lock terms. Acreage flagged: <span className="text-amber-400">{Math.floor(acres).toLocaleString()}</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-amber-500/40 bg-gradient-to-br from-amber-500/[0.05] to-transparent p-7">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-amber-400">
          <ShieldCheck className="h-4 w-4" />
          ENTERPRISE INTAKE // {Math.floor(acres).toLocaleString()} ACRES
        </div>
        <span className="text-[10px] font-mono text-slate-500">TIER-IV</span>
      </div>

      <h3 className="font-display text-2xl font-black uppercase tracking-tighter">
        Above 50k acres? <span className="text-amber-400">We hand-build the deal.</span>
      </h3>
      <p className="mt-2 text-xs text-slate-400 leading-relaxed">
        Self-serve checkout caps out here. Submit below — an operator routes terms,
        revisit cadence, and white-glove onboarding directly to your inbox within 24h.
      </p>

      <form data-testid="enterprise-form" onSubmit={submit} className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="OPERATOR HANDLE *" testid="ent-name" value={form.name} onChange={set("name")} placeholder="Duane Clevenger" />
        <Field label="CHANNEL EMAIL *" testid="ent-email" type="email" value={form.email} onChange={set("email")} placeholder="ops@coop.ag" />
        <Field label="ORGANIZATION *" testid="ent-org" value={form.organization} onChange={set("organization")} placeholder="Pioneer Co-op" />
        <Select
          label="TIMELINE"
          testid="ent-timeline"
          value={form.timeline}
          onChange={set("timeline")}
          options={["Immediate", "1–3 months", "3–6 months", "6–12 months", "Exploring"]}
        />
        <label className="sm:col-span-2 block">
          <div className="text-[10px] uppercase tracking-[0.24em] text-amber-400 mb-2">CONTEXT</div>
          <textarea
            data-testid="ent-message"
            value={form.message}
            onChange={set("message")}
            rows={3}
            placeholder="Crop mix, region, existing tooling, must-haves…"
            className="w-full bg-transparent border border-slate-700 focus:border-amber-400 outline-none font-mono text-sm text-white py-2 px-3 placeholder:text-slate-600 transition-colors"
          />
        </label>
        <div className="sm:col-span-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
          <span className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
            {">"} encrypted // routed to ops // no spam
          </span>
          <button
            data-testid="enterprise-submit"
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 bg-amber-500 px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.22em] text-black hover:bg-amber-400 disabled:opacity-60 transition-colors"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            {submitting ? "Transmitting…" : "Route to Ops"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, testid, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="block">
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

function Select({ label, testid, value, onChange, options }) {
  return (
    <label className="block">
      <div className="text-[10px] uppercase tracking-[0.24em] text-amber-400 mb-2">{label}</div>
      <select
        data-testid={testid}
        value={value}
        onChange={onChange}
        className="w-full bg-[#0c0e12] border border-slate-700 focus:border-amber-400 outline-none font-mono text-sm text-white py-2.5 px-3 transition-colors"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-[#0c0e12]">{o}</option>
        ))}
      </select>
    </label>
  );
}
