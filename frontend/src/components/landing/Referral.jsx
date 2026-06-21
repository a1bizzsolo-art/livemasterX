import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Share2, Copy, Check, Gift, Loader2 } from "lucide-react";

export default function Referral({ api }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Channel email required.");
      return;
    }
    setSubmitting(true);
    try {
      const r = await axios.post(`${api}/referral/code`, {
        email: email.trim(),
        name: name.trim() || undefined,
      });
      setCode(r.data);
      toast.success("Referral channel locked.");
    } catch (err) {
      const msg = err?.response?.data?.detail || "Failed. Retry.";
      toast.error(typeof msg === "string" ? msg : "Failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const shareUrl = code ? `${window.location.origin}${code.share_url_suffix}` : "";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Share link copied.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copy failed.");
    }
  };

  return (
    <section id="referral" className="relative border-b border-slate-800 bg-[#08090b]">
      <div className="absolute inset-0 grid-bg-dense opacity-40 pointer-events-none" />
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-16 lg:py-20 relative">
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-amber-400">// 09</span>
          <span className="h-px flex-1 bg-slate-800" />
          <span className="text-[10px] uppercase tracking-[0.28em] text-slate-500">
            REFERRAL CHANNEL // EVERY OPERATOR IS A SALES NODE
          </span>
        </div>

        <div className="mt-4 grid lg:grid-cols-12 gap-0 border border-slate-800 bg-[#0c0e12]">
          {/* Left — pitch */}
          <div className="lg:col-span-5 p-7 lg:p-10 border-b lg:border-b-0 lg:border-r border-slate-800">
            <h2 className="font-display text-3xl lg:text-4xl font-black uppercase tracking-tighter">
              Refer one. <br />
              <span className="text-amber-400">Earn forever.</span>
            </h2>
            <p className="mt-4 text-sm text-slate-400 leading-relaxed">
              Generate a code. Share it with any operator. They get <span className="text-amber-400">10% off</span> their
              contract. You earn <span className="text-amber-400">10% back</span> on every deal that closes — no cap.
            </p>

            <div className="mt-8 grid grid-cols-3 border border-slate-800">
              {[
                ["BUYER GETS", "10% off"],
                ["YOU EARN", "10% kick"],
                ["CAP", "None"],
              ].map(([k, v]) => (
                <div key={k} className="px-4 py-3 border-r last:border-r-0 border-slate-800">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">{k}</div>
                  <div className="font-display text-base font-black text-amber-400">{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — form / code */}
          <div className="lg:col-span-7 p-7 lg:p-10">
            {!code ? (
              <form data-testid="referral-form" onSubmit={generate} className="space-y-5">
                <div className="text-[10px] uppercase tracking-[0.24em] text-amber-400 flex items-center gap-2">
                  <Gift className="h-3 w-3" />
                  GENERATE YOUR CODE
                </div>
                <label className="block">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500 mb-1.5">YOUR EMAIL *</div>
                  <input
                    data-testid="referral-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@operator.io"
                    className="w-full bg-transparent border-0 border-b border-slate-700 focus:border-amber-400 outline-none font-mono text-sm text-white py-2 placeholder:text-slate-600"
                  />
                </label>
                <label className="block">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500 mb-1.5">YOUR HANDLE (optional)</div>
                  <input
                    data-testid="referral-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Operator Name"
                    className="w-full bg-transparent border-0 border-b border-slate-700 focus:border-amber-400 outline-none font-mono text-sm text-white py-2 placeholder:text-slate-600"
                  />
                </label>
                <button
                  data-testid="referral-generate"
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 bg-amber-500 px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.22em] text-black hover:bg-amber-400 disabled:opacity-60 transition-colors"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-3.5 w-3.5" />}
                  Generate Code
                </button>
              </form>
            ) : (
              <div data-testid="referral-success" className="space-y-5">
                <div className="text-[10px] uppercase tracking-[0.24em] text-emerald-400 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 bg-emerald-400 blink" />
                  CHANNEL LOCKED
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500 mb-2">YOUR CODE</div>
                  <div className="font-display text-3xl lg:text-4xl font-black tracking-tighter text-amber-400">
                    {code.code}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500 mb-2">SHARE LINK</div>
                  <div className="flex items-stretch border border-slate-700">
                    <input
                      data-testid="referral-share-url"
                      readOnly
                      value={shareUrl}
                      className="flex-1 bg-transparent px-3 py-2.5 font-mono text-xs text-slate-300 outline-none"
                    />
                    <button
                      data-testid="referral-copy"
                      onClick={copy}
                      className="px-4 bg-amber-500 hover:bg-amber-400 text-black inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.22em] transition-colors"
                    >
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every time someone activates AQAS using your link, they get 10% off and you receive 10% back as credit.
                  Track redemptions in your operator dashboard once you sign in.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
