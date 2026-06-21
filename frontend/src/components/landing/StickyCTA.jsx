import React, { useEffect, useState } from "react";
import axios from "axios";
import { ArrowRight } from "lucide-react";

export default function StickyCTA({ api }) {
  const [visible, setVisible] = useState(false);
  const [stats, setStats] = useState({ revenue: 0, count: 0 });

  useEffect(() => {
    const onScroll = () => {
      // Show only after the user scrolls past the hero (~600px).
      setVisible(window.scrollY > 600);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = () =>
      axios.get(`${api}/deals/stats`).then((r) => mounted && setStats(r.data)).catch(() => {});
    load();
    const t = setInterval(load, 60000);
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, [api]);

  const goPricing = () =>
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth", block: "start" });

  if (!visible) return null;

  return (
    <div
      data-testid="sticky-cta"
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 max-w-[96%] sm:max-w-md w-full px-3 sm:px-0"
    >
      <div className="flex items-center gap-3 border border-amber-500/60 bg-[#0c0e12]/95 backdrop-blur px-3 py-2 amber-glow">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-slate-400">
          <span className="h-1.5 w-1.5 bg-emerald-400 blink" />
          <span className="hidden sm:inline">
            {stats.count > 0 ? `${stats.count} closed` : "Live"}
          </span>
          <span className="text-amber-400 hidden sm:inline">·</span>
          <span className="text-amber-400">From $3.02/ac/yr</span>
        </div>
        <button
          data-testid="sticky-cta-button"
          onClick={goPricing}
          className="ml-auto group inline-flex items-center gap-1.5 bg-amber-500 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-black hover:bg-amber-400 transition-colors"
        >
          Quote
          <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
