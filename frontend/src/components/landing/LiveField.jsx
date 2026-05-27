import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Satellite, Droplets, Wind, Thermometer, CloudRain, Activity, RefreshCw, MapPin } from "lucide-react";

const FIELDS = [
  { id: "central-valley", label: "Central Valley // CA", crop: "Almonds" },
  { id: "iowa-corn-belt", label: "Corn Belt // IA", crop: "Corn" },
  { id: "punjab-wheat", label: "Punjab Plain // IN", crop: "Wheat" },
  { id: "pampas", label: "Pampas // AR", crop: "Soy" },
];

const STATUS_TONE = {
  critical: { dot: "bg-red-500", text: "text-red-400", border: "border-red-500/60", bg: "bg-red-500/10" },
  low: { dot: "bg-amber-400", text: "text-amber-400", border: "border-amber-500/60", bg: "bg-amber-500/10" },
  optimal: { dot: "bg-emerald-400", text: "text-emerald-400", border: "border-emerald-500/60", bg: "bg-emerald-500/10" },
  saturated: { dot: "bg-cyan-400", text: "text-cyan-400", border: "border-cyan-500/60", bg: "bg-cyan-500/10" },
  unknown: { dot: "bg-slate-400", text: "text-slate-400", border: "border-slate-700", bg: "bg-slate-800/30" },
};

const ADVISORY_TONE = {
  action: "border-red-500/60 text-red-400 bg-red-500/10",
  watch: "border-amber-500/60 text-amber-400 bg-amber-500/10",
  info: "border-cyan-500/60 text-cyan-400 bg-cyan-500/10",
  ok: "border-emerald-500/60 text-emerald-400 bg-emerald-500/10",
};

export default function LiveField({ api }) {
  const [fieldId, setFieldId] = useState("central-valley");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshedAt, setRefreshedAt] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await axios.get(`${api}/field/live`, { params: { field: fieldId } });
      setData(r.data);
      setRefreshedAt(new Date());
    } catch {
      /* noop — backend has graceful fallback */
    } finally {
      setLoading(false);
    }
  }, [api, fieldId]);

  useEffect(() => {
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [load]);

  const status = data?.current?.moisture_status || "unknown";
  const tone = STATUS_TONE[status] || STATUS_TONE.unknown;

  return (
    <section id="live" className="relative border-b border-slate-800">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-16 lg:py-24">
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-amber-400">// 04</span>
          <span className="h-px flex-1 bg-slate-800" />
          <span className="text-[10px] uppercase tracking-[0.28em] text-slate-500">
            LIVE FIELD INTELLIGENCE // SATELLITE-DERIVED
          </span>
        </div>
        <div className="mt-4 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter max-w-3xl">
            Live data, <span className="text-amber-400">right now,</span> from orbit.
          </h2>
          <p className="max-w-md text-xs text-slate-400 leading-relaxed">
            Real satellite-derived soil moisture, evapotranspiration and reanalysis weather —
            streaming live below. Switch a field to see continuous telemetry. Auto-refreshes every
            60s.
          </p>
        </div>

        {/* Field selector */}
        <div className="mt-10 flex flex-wrap items-stretch border border-slate-800">
          {FIELDS.map((f) => {
            const active = f.id === fieldId;
            return (
              <button
                key={f.id}
                data-testid={`field-${f.id}`}
                onClick={() => setFieldId(f.id)}
                className={`flex-1 min-w-[180px] text-left px-5 py-4 border-r last:border-r-0 border-slate-800 transition-colors ${
                  active ? "bg-amber-500/10" : "hover:bg-slate-900/40"
                }`}
              >
                <div className="flex items-center gap-2">
                  <MapPin
                    className={`h-3.5 w-3.5 ${active ? "text-amber-400" : "text-slate-500"}`}
                  />
                  <span
                    className={`text-[10px] uppercase tracking-[0.22em] ${
                      active ? "text-amber-400" : "text-slate-500"
                    }`}
                  >
                    {f.crop}
                  </span>
                </div>
                <div
                  className={`mt-1.5 font-display text-sm font-bold uppercase tracking-tight ${
                    active ? "text-white" : "text-slate-300"
                  }`}
                >
                  {f.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* Telemetry grid */}
        <div className="mt-0 grid grid-cols-1 lg:grid-cols-12 border border-t-0 border-slate-800">
          {/* Header bar */}
          <div className="lg:col-span-12 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 px-5 py-3 bg-black/40 gap-3">
            <div className="flex items-center gap-3">
              <Satellite className="h-4 w-4 text-amber-400" />
              <span className="text-[10px] uppercase tracking-[0.22em] text-slate-400">
                {data?.source || "Connecting to orbital feed…"}
              </span>
            </div>
            <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.22em] text-slate-500">
              <span className="flex items-center gap-2">
                <span className={`h-1.5 w-1.5 ${tone.dot} blink`} />
                <span className={tone.text}>{status}</span>
              </span>
              {refreshedAt && (
                <span>updated {refreshedAt.toLocaleTimeString()}</span>
              )}
              <button
                data-testid="live-refresh"
                onClick={load}
                disabled={loading}
                className="inline-flex items-center gap-1.5 border border-slate-700 px-2.5 py-1 hover:border-amber-500 hover:text-amber-400 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
                refresh
              </button>
            </div>
          </div>

          {/* Metric tiles */}
          <Metric
            icon={Droplets}
            label="Surface soil moisture"
            value={fmtPct(data?.current?.soil_moisture_surface)}
            unit="m³/m³"
            sub={status.toUpperCase()}
            toneClass={`${tone.text}`}
            testid="m-soil-surface"
          />
          <Metric
            icon={Droplets}
            label="Root-zone moisture"
            value={fmt(data?.current?.soil_moisture_root, 3)}
            unit="m³/m³ • 1–3cm"
            sub="depth band"
            testid="m-soil-root"
          />
          <Metric
            icon={Thermometer}
            label="Air temperature"
            value={fmt(data?.current?.temperature_c, 1)}
            unit="°C"
            sub={`${fmt(data?.current?.humidity_pct, 0)}% RH`}
            testid="m-temp"
          />
          <Metric
            icon={Wind}
            label="Wind 10m"
            value={fmt(data?.current?.wind_kmh, 1)}
            unit="km/h"
            sub="canopy mix"
            testid="m-wind"
          />
          <Metric
            icon={CloudRain}
            label="Precip 24h"
            value={fmt(data?.derived?.precip_24h_mm, 2)}
            unit="mm"
            sub="rolling"
            testid="m-precip"
          />
          <Metric
            icon={Activity}
            label="Evapotranspiration 24h"
            value={fmt(data?.derived?.et_24h_mm, 2)}
            unit="mm"
            sub="ET demand"
            testid="m-et"
          />
          <Metric
            icon={Satellite}
            label="NDVI estimate"
            value={fmt(data?.derived?.ndvi_estimate, 3)}
            unit="vegetation"
            sub={ndviBand(data?.derived?.ndvi_estimate)}
            toneClass="text-emerald-400"
            testid="m-ndvi"
          />
          <Metric
            icon={MapPin}
            label="Coordinates"
            value={
              data
                ? `${data.lat.toFixed(3)}°, ${data.lon.toFixed(3)}°`
                : "—"
            }
            unit={data?.label}
            sub="WGS-84"
            mono
            testid="m-coords"
          />

          {/* Sparkline + advisory */}
          <div className="lg:col-span-12 grid lg:grid-cols-12 border-t border-slate-800">
            <div className="lg:col-span-7 p-6 border-b lg:border-b-0 lg:border-r border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">
                  Root-zone moisture // last 24h
                </div>
                <div className="text-[10px] font-mono text-slate-500">
                  range {sparkRange(data?.derived?.soil_moisture_series_24h)}
                </div>
              </div>
              <Sparkline series={data?.derived?.soil_moisture_series_24h || []} />
            </div>

            <div className="lg:col-span-5 p-6">
              <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500 mb-4">
                AQAS advisory // autonomous
              </div>
              <div className="space-y-2">
                {(data?.advisory || []).map((a, i) => (
                  <div
                    key={i}
                    data-testid={`advisory-${i}`}
                    className={`border px-3 py-2.5 text-[12px] leading-relaxed ${ADVISORY_TONE[a.level] || ADVISORY_TONE.info}`}
                  >
                    <div className="text-[10px] uppercase tracking-[0.22em] opacity-80 mb-1">
                      {a.level}
                    </div>
                    <div className="font-mono">{a.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ icon: Icon, label, value, unit, sub, toneClass = "text-white", mono = false, testid }) {
  return (
    <div
      data-testid={testid}
      className="lg:col-span-3 p-5 border-b border-r border-slate-800 last:border-r-0 odd:lg:border-r even:lg:border-r [&:nth-child(4n+1)]:lg:border-l-0"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-slate-500">
          <Icon className="h-3 w-3" />
          <span>{label}</span>
        </div>
      </div>
      <div className={`mt-3 font-display ${mono ? "text-base font-mono" : "text-3xl font-black"} ${toneClass}`}>
        {value}
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <span>{unit}</span>
        <span className="uppercase tracking-[0.18em]">{sub}</span>
      </div>
    </div>
  );
}

function Sparkline({ series }) {
  const clean = series.filter((v) => typeof v === "number");
  if (clean.length < 2) {
    return (
      <div className="h-28 flex items-center justify-center text-[10px] uppercase tracking-[0.22em] text-slate-600">
        awaiting telemetry…
      </div>
    );
  }
  const min = Math.min(...clean);
  const max = Math.max(...clean);
  const span = max - min || 0.001;
  const w = 100;
  const h = 40;
  const pts = clean
    .map((v, i) => {
      const x = (i / (clean.length - 1)) * w;
      const y = h - ((v - min) / span) * h;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-28 w-full">
      <defs>
        <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFB000" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FFB000" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke="#FFB000" strokeWidth="0.7" />
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill="url(#spark)" />
    </svg>
  );
}

function fmt(v, d = 2) {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return Number(v).toFixed(d);
}
function fmtPct(v) {
  if (v === null || v === undefined) return "—";
  return Number(v).toFixed(3);
}
function ndviBand(v) {
  if (v == null) return "—";
  if (v < 0.3) return "bare";
  if (v < 0.5) return "stressed";
  if (v < 0.7) return "healthy";
  return "vigorous";
}
function sparkRange(arr) {
  const c = (arr || []).filter((v) => typeof v === "number");
  if (!c.length) return "—";
  return `${Math.min(...c).toFixed(3)} → ${Math.max(...c).toFixed(3)}`;
}
