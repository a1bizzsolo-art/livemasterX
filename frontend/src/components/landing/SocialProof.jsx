import React, { useEffect, useState } from "react";
import axios from "axios";
import { Flame, Activity } from "lucide-react";

export default function SocialProof({ api }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = () =>
      axios.get(`${api}/social-proof`).then((r) => mounted && setData(r.data)).catch(() => {});
    load();
    const t = setInterval(load, 30000);
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, [api]);

  if (!data) return null;

  const messages = [];
  if (data.deals_24h > 0) {
    messages.push(`${data.deals_24h} deal${data.deals_24h > 1 ? "s" : ""} closed in last 24h`);
  }
  if (data.waitlist_24h > 0) {
    messages.push(`${data.waitlist_24h} new operator${data.waitlist_24h > 1 ? "s" : ""} joined`);
  }
  if (data.deals_total > 0) {
    messages.push(`${data.deals_total} active operator${data.deals_total > 1 ? "s" : ""}`);
  }
  if (messages.length === 0) {
    messages.push(`${data.agents_online.toLocaleString()} agents online`);
  }

  return (
    <div data-testid="social-proof-banner" className="border-b border-amber-500/40 bg-amber-500/[0.06]">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-2 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-amber-300">
          <Flame className="h-3 w-3 text-amber-400" />
          <span>{messages.join(" • ")}</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-slate-400">
          <Activity className="h-3 w-3 text-emerald-400" />
          <span className="text-slate-300">
            Live · {data.agents_online.toLocaleString()} agents · {data.waitlist_total} on waitlist
          </span>
        </div>
      </div>
    </div>
  );
}
